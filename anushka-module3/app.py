"""
Module 3 — Storage and API for Segregated Events
CyberCode EduLabs | Anushka

Flask + SQLite backend that:
  - Stores enriched, MITRE-mapped events from Module 2
  - Exposes REST endpoints to write and read events
  - Supports filtering by attack_type and severity
"""

from flask import Flask, request, jsonify, g
import sqlite3
import os
from datetime import datetime

app = Flask(__name__)

DB_PATH = os.path.join(os.path.dirname(__file__), "events.db")


# ─── DB helpers ────────────────────────────────────────────────────────────────

def get_db():
    db = getattr(g, "_database", None)
    if db is None:
        db = g._database = sqlite3.connect(DB_PATH)
        db.row_factory = sqlite3.Row          # dict-like rows
    return db


@app.teardown_appcontext
def close_db(exc):
    db = getattr(g, "_database", None)
    if db is not None:
        db.close()


def init_db():
    with app.app_context():
        db = get_db()
        db.executescript("""
            CREATE TABLE IF NOT EXISTS events (
                id            INTEGER PRIMARY KEY AUTOINCREMENT,
                timestamp     TEXT    NOT NULL DEFAULT (datetime('now')),
                source_ip     TEXT,
                dest_ip       TEXT,
                attack_type   TEXT    NOT NULL,
                severity      TEXT    NOT NULL CHECK(severity IN ('LOW','MEDIUM','HIGH','CRITICAL')),
                mitre_tactic  TEXT,
                mitre_technique TEXT,
                description   TEXT,
                raw_log       TEXT
            );

            CREATE INDEX IF NOT EXISTS idx_attack_type ON events(attack_type);
            CREATE INDEX IF NOT EXISTS idx_severity    ON events(severity);
            CREATE INDEX IF NOT EXISTS idx_timestamp   ON events(timestamp);
        """)
        db.commit()


# ─── Routes ────────────────────────────────────────────────────────────────────

@app.route("/")
def index():
    return jsonify({
        "service": "CyberCode Module 3 — Event Storage API",
        "version": "1.0.0",
        "endpoints": {
            "POST /events":         "Ingest one or more enriched events",
            "GET  /events":         "List events (filterable by attack_type, severity, limit, offset)",
            "GET  /events/<id>":    "Get single event by ID",
            "GET  /events/stats":   "Aggregated counts by attack_type and severity",
            "DELETE /events/<id>":  "Delete event by ID",
        }
    })


# ── POST /events ────────────────────────────────────────────────────────────────
@app.route("/events", methods=["POST"])
def ingest_events():
    """
    Accept a single event object OR a list of event objects.
    Required fields: attack_type, severity
    Optional: source_ip, dest_ip, mitre_tactic, mitre_technique, description, raw_log, timestamp
    """
    payload = request.get_json(silent=True)
    if payload is None:
        return jsonify({"error": "Request body must be valid JSON"}), 400

    # Normalise to list
    events = payload if isinstance(payload, list) else [payload]

    VALID_SEVERITIES = {"LOW", "MEDIUM", "HIGH", "CRITICAL"}
    inserted_ids = []
    errors = []

    db = get_db()
    for idx, ev in enumerate(events):
        # Validate required fields
        if not ev.get("attack_type"):
            errors.append({"index": idx, "error": "attack_type is required"})
            continue
        severity = str(ev.get("severity", "")).upper()
        if severity not in VALID_SEVERITIES:
            errors.append({"index": idx, "error": f"severity must be one of {VALID_SEVERITIES}"})
            continue

        ts = ev.get("timestamp") or datetime.utcnow().isoformat()

        cur = db.execute(
            """
            INSERT INTO events
              (timestamp, source_ip, dest_ip, attack_type, severity,
               mitre_tactic, mitre_technique, description, raw_log)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                ts,
                ev.get("source_ip"),
                ev.get("dest_ip"),
                ev.get("attack_type"),
                severity,
                ev.get("mitre_tactic"),
                ev.get("mitre_technique"),
                ev.get("description"),
                ev.get("raw_log"),
            ),
        )
        inserted_ids.append(cur.lastrowid)

    db.commit()

    response = {"inserted": len(inserted_ids), "ids": inserted_ids}
    if errors:
        response["errors"] = errors
    status = 207 if errors and inserted_ids else (400 if errors else 201)
    return jsonify(response), status


# ── GET /events ─────────────────────────────────────────────────────────────────
@app.route("/events", methods=["GET"])
def list_events():
    """
    Query params:
      attack_type  – filter by attack type (partial match, case-insensitive)
      severity     – filter by severity (exact, case-insensitive); comma-sep list ok
      limit        – max rows (default 50, max 500)
      offset       – pagination offset (default 0)
      order        – 'asc' or 'desc' by timestamp (default 'desc')
    """
    attack_type = request.args.get("attack_type")
    severity_raw = request.args.get("severity")
    limit = min(int(request.args.get("limit", 50)), 500)
    offset = int(request.args.get("offset", 0))
    order = "ASC" if request.args.get("order", "desc").lower() == "asc" else "DESC"

    query = "SELECT * FROM events WHERE 1=1"
    params = []

    if attack_type:
        query += " AND LOWER(attack_type) LIKE ?"
        params.append(f"%{attack_type.lower()}%")

    if severity_raw:
        severities = [s.strip().upper() for s in severity_raw.split(",")]
        placeholders = ",".join("?" * len(severities))
        query += f" AND severity IN ({placeholders})"
        params.extend(severities)

    query += f" ORDER BY timestamp {order} LIMIT ? OFFSET ?"
    params.extend([limit, offset])

    db = get_db()
    rows = db.execute(query, params).fetchall()
    count_row = db.execute(
        "SELECT COUNT(*) FROM events WHERE 1=1"
        + (" AND LOWER(attack_type) LIKE ?" if attack_type else "")
        + (f" AND severity IN ({','.join('?'*len(severities))})" if severity_raw else ""),
        params[:-2],   # strip limit/offset
    ).fetchone()

    return jsonify({
        "total": count_row[0],
        "limit": limit,
        "offset": offset,
        "events": [dict(r) for r in rows],
    })


# ── GET /events/stats ───────────────────────────────────────────────────────────
@app.route("/events/stats", methods=["GET"])
def event_stats():
    db = get_db()
    by_type = db.execute(
        "SELECT attack_type, COUNT(*) as count FROM events GROUP BY attack_type ORDER BY count DESC"
    ).fetchall()
    by_severity = db.execute(
        "SELECT severity, COUNT(*) as count FROM events GROUP BY severity"
    ).fetchall()
    by_tactic = db.execute(
        "SELECT mitre_tactic, COUNT(*) as count FROM events WHERE mitre_tactic IS NOT NULL GROUP BY mitre_tactic ORDER BY count DESC"
    ).fetchall()

    return jsonify({
        "total_events": db.execute("SELECT COUNT(*) FROM events").fetchone()[0],
        "by_attack_type": [dict(r) for r in by_type],
        "by_severity": [dict(r) for r in by_severity],
        "by_mitre_tactic": [dict(r) for r in by_tactic],
    })


# ── GET /events/<id> ────────────────────────────────────────────────────────────
@app.route("/events/<int:event_id>", methods=["GET"])
def get_event(event_id):
    db = get_db()
    row = db.execute("SELECT * FROM events WHERE id = ?", (event_id,)).fetchone()
    if row is None:
        return jsonify({"error": f"Event {event_id} not found"}), 404
    return jsonify(dict(row))


# ── DELETE /events/<id> ─────────────────────────────────────────────────────────
@app.route("/events/<int:event_id>", methods=["DELETE"])
def delete_event(event_id):
    db = get_db()
    cur = db.execute("DELETE FROM events WHERE id = ?", (event_id,))
    db.commit()
    if cur.rowcount == 0:
        return jsonify({"error": f"Event {event_id} not found"}), 404
    return jsonify({"deleted": event_id})


# ─── Entry point ───────────────────────────────────────────────────────────────

if __name__ == "__main__":
    init_db()
    print("✅ Database initialised. Starting Flask on http://127.0.0.1:5000")
    app.run(debug=True, port=5000)
