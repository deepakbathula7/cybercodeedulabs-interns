"""
Flask + SQLite backend for the CyberCode EduLabs Kanban board.
Replaces browser localStorage with a real, persistent API.

Setup (on the Digital Fort container):
    pip3 install flask flask-cors
    python3 app.py

The server binds to 0.0.0.0:5000 so it's reachable from your laptop's
browser over the container's LAN/VPN IP (not just localhost inside the
container).
"""

import sqlite3
from datetime import datetime, timezone

from flask import Flask, g, jsonify, request
from flask_cors import CORS

DB_PATH = "kanban.db"
VALID_STATUSES = {"todo", "in_progress", "done"}

app = Flask(__name__)
CORS(app)  # allow the React app (different origin/port) to call this API


# ---------------------------------------------------------------------------
# DB helpers
# ---------------------------------------------------------------------------

def get_db():
    """Request-scoped SQLite connection, rows accessible by column name."""
    if "db" not in g:
        g.db = sqlite3.connect(DB_PATH)
        g.db.row_factory = sqlite3.Row
    return g.db


@app.teardown_appcontext
def close_db(_exc):
    db = g.pop("db", None)
    if db is not None:
        db.close()


def init_db():
    """Create the tasks table if it doesn't exist yet. Safe to call every boot."""
    conn = sqlite3.connect(DB_PATH)
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS tasks (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            title       TEXT NOT NULL,
            description TEXT NOT NULL DEFAULT '',
            status      TEXT NOT NULL DEFAULT 'todo'
                        CHECK (status IN ('todo', 'in_progress', 'done')),
            created_at  TEXT NOT NULL,
            updated_at  TEXT NOT NULL
        )
        """
    )
    conn.commit()
    conn.close()


def row_to_dict(row: sqlite3.Row) -> dict:
    return {
        "id": row["id"],
        "title": row["title"],
        "description": row["description"],
        "status": row["status"],
        "created_at": row["created_at"],
        "updated_at": row["updated_at"],
    }


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@app.route("/tasks", methods=["GET"])
def get_tasks():
    db = get_db()
    rows = db.execute("SELECT * FROM tasks ORDER BY id ASC").fetchall()
    return jsonify([row_to_dict(r) for r in rows]), 200


@app.route("/tasks", methods=["POST"])
def create_task():
    payload = request.get_json(silent=True) or {}
    title = (payload.get("title") or "").strip()
    if not title:
        return jsonify({"error": "title is required"}), 400

    description = payload.get("description", "")
    status = payload.get("status", "todo")
    if status not in VALID_STATUSES:
        return jsonify({"error": f"status must be one of {sorted(VALID_STATUSES)}"}), 400

    ts = now_iso()
    db = get_db()
    cur = db.execute(
        "INSERT INTO tasks (title, description, status, created_at, updated_at) "
        "VALUES (?, ?, ?, ?, ?)",
        (title, description, status, ts, ts),
    )
    db.commit()
    new_row = db.execute("SELECT * FROM tasks WHERE id = ?", (cur.lastrowid,)).fetchone()
    return jsonify(row_to_dict(new_row)), 201


@app.route("/tasks/<int:task_id>", methods=["PATCH"])
def update_task(task_id):
    db = get_db()
    existing = db.execute("SELECT * FROM tasks WHERE id = ?", (task_id,)).fetchone()
    if existing is None:
        return jsonify({"error": f"task {task_id} not found"}), 404

    payload = request.get_json(silent=True) or {}
    if not payload:
        return jsonify({"error": "request body must include at least one field"}), 400

    fields, values = [], []
    if "title" in payload:
        title = (payload["title"] or "").strip()
        if not title:
            return jsonify({"error": "title cannot be empty"}), 400
        fields.append("title = ?")
        values.append(title)
    if "description" in payload:
        fields.append("description = ?")
        values.append(payload["description"])
    if "status" in payload:
        if payload["status"] not in VALID_STATUSES:
            return jsonify({"error": f"status must be one of {sorted(VALID_STATUSES)}"}), 400
        fields.append("status = ?")
        values.append(payload["status"])

    if not fields:
        return jsonify({"error": "no valid fields to update"}), 400

    fields.append("updated_at = ?")
    values.append(now_iso())
    values.append(task_id)

    db.execute(f"UPDATE tasks SET {', '.join(fields)} WHERE id = ?", values)
    db.commit()
    updated = db.execute("SELECT * FROM tasks WHERE id = ?", (task_id,)).fetchone()
    return jsonify(row_to_dict(updated)), 200


@app.route("/tasks/<int:task_id>", methods=["DELETE"])
def delete_task(task_id):
    db = get_db()
    existing = db.execute("SELECT * FROM tasks WHERE id = ?", (task_id,)).fetchone()
    if existing is None:
        return jsonify({"error": f"task {task_id} not found"}), 404
    db.execute("DELETE FROM tasks WHERE id = ?", (task_id,))
    db.commit()
    return jsonify({"deleted": task_id}), 200


@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"}), 200


if __name__ == "__main__":
    init_db()
    app.run(host="0.0.0.0", port=5000, debug=True)
