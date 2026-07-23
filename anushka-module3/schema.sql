-- ============================================================
-- Module 3 — Event Storage Schema
-- CyberCode EduLabs | Anushka
-- ============================================================

CREATE TABLE IF NOT EXISTS events (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp       TEXT    NOT NULL DEFAULT (datetime('now')),
    source_ip       TEXT,
    dest_ip         TEXT,
    attack_type     TEXT    NOT NULL,
    severity        TEXT    NOT NULL
                    CHECK(severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    mitre_tactic    TEXT,
    mitre_technique TEXT,
    description     TEXT,
    raw_log         TEXT
);

CREATE INDEX IF NOT EXISTS idx_attack_type ON events(attack_type);
CREATE INDEX IF NOT EXISTS idx_severity    ON events(severity);
CREATE INDEX IF NOT EXISTS idx_timestamp   ON events(timestamp);

-- ============================================================
-- Real Module 2 enriched events
-- ============================================================

INSERT INTO events (timestamp, source_ip, attack_type, severity, mitre_tactic, mitre_technique, description, raw_log) VALUES
('2026-06-25 14:09:01', '185.220.101.47', 'SSH Brute Force', 'MEDIUM', 'Credential Access', 'T1110', 'SSH failure - User: deploy', 'SSH_FAILURE | MEDIUM | IP: 185.220.101.47 | User: deploy'),
('2026-06-25 14:09:01', '185.220.101.47', 'SSH Brute Force', 'MEDIUM', 'Credential Access', 'T1110', 'SSH failure - User: ubuntu', 'SSH_FAILURE | MEDIUM | IP: 185.220.101.47 | User: ubuntu'),
('2026-06-25 14:09:02', '185.220.101.47', 'SSH Brute Force', 'MEDIUM', 'Credential Access', 'T1110', 'SSH failure - User: test', 'SSH_FAILURE | MEDIUM | IP: 185.220.101.47 | User: test'),
('2026-06-25 14:09:03', '185.220.101.47', 'SSH Brute Force', 'MEDIUM', 'Credential Access', 'T1110', 'SSH failure - User: git', 'SSH_FAILURE | MEDIUM | IP: 185.220.101.47 | User: git'),
('2026-06-25 14:09:14', '185.220.101.47', 'Privilege Escalation', 'HIGH', 'Privilege Escalation', 'T1078', 'Root attack - Valid Accounts', 'ROOT_ATTACK | HIGH | IP: 185.220.101.47 | User: root'),
('2026-06-25 14:09:15', '185.220.101.47', 'Privilege Escalation', 'HIGH', 'Privilege Escalation', 'T1078', 'Root attack - Valid Accounts', 'ROOT_ATTACK | HIGH | IP: 185.220.101.47 | User: root'),
('2026-06-25 14:09:16', '185.220.101.47', 'Privilege Escalation', 'HIGH', 'Privilege Escalation', 'T1078', 'Root attack - Valid Accounts', 'ROOT_ATTACK | HIGH | IP: 185.220.101.47 | User: root'),
('2026-06-25 14:09:27', '185.220.101.47', 'SSH Brute Force', 'MEDIUM', 'Credential Access', 'T1110', 'SSH failure - User: bruteuser1', 'SSH_FAILURE | MEDIUM | IP: 185.220.101.47 | User: bruteuser1'),
('2026-06-25 14:09:27', '185.220.101.47', 'Brute Force', 'HIGH', 'Credential Access', 'T1110.001', '5 failures in 60 seconds - Password Guessing', 'BRUTE_FORCE | HIGH | IP: 185.220.101.47 | 5 failures in 60 seconds'),
('2026-06-25 14:09:27', '185.220.101.47', 'SSH Brute Force', 'MEDIUM', 'Credential Access', 'T1110', 'SSH failure - User: bruteuser2', 'SSH_FAILURE | MEDIUM | IP: 185.220.101.47 | User: bruteuser2'),
('2026-06-25 14:09:27', '185.220.101.47', 'Brute Force', 'HIGH', 'Credential Access', 'T1110.001', '5 failures in 60 seconds - Password Guessing', 'BRUTE_FORCE | HIGH | IP: 185.220.101.47 | 5 failures in 60 seconds'),
('2026-06-25 14:09:27', '185.220.101.47', 'SSH Brute Force', 'MEDIUM', 'Credential Access', 'T1110', 'SSH failure - User: bruteuser3', 'SSH_FAILURE | MEDIUM | IP: 185.220.101.47 | User: bruteuser3'),
('2026-06-25 14:09:27', '185.220.101.47', 'Brute Force', 'HIGH', 'Credential Access', 'T1110.001', '5 failures in 60 seconds - Password Guessing', 'BRUTE_FORCE | HIGH | IP: 185.220.101.47 | 5 failures in 60 seconds'),
('2026-06-25 14:09:27', '185.220.101.47', 'SSH Brute Force', 'MEDIUM', 'Credential Access', 'T1110', 'SSH failure - User: bruteuser4', 'SSH_FAILURE | MEDIUM | IP: 185.220.101.47 | User: bruteuser4'),
('2026-06-25 14:09:27', '185.220.101.47', 'Brute Force', 'HIGH', 'Credential Access', 'T1110.001', '5 failures in 60 seconds - Password Guessing', 'BRUTE_FORCE | HIGH | IP: 185.220.101.47 | 5 failures in 60 seconds'),
('2026-06-25 14:09:28', '185.220.101.47', 'SSH Brute Force', 'MEDIUM', 'Credential Access', 'T1110', 'SSH failure - User: bruteuser5', 'SSH_FAILURE | MEDIUM | IP: 185.220.101.47 | User: bruteuser5'),
('2026-06-25 14:09:28', '185.220.101.47', 'Brute Force', 'HIGH', 'Credential Access', 'T1110.001', '5 failures in 60 seconds - Password Guessing', 'BRUTE_FORCE | HIGH | IP: 185.220.101.47 | 5 failures in 60 seconds'),
('2026-06-25 14:09:28', '185.220.101.47', 'SSH Brute Force', 'MEDIUM', 'Credential Access', 'T1110', 'SSH failure - User: bruteuser6', 'SSH_FAILURE | MEDIUM | IP: 185.220.101.47 | User: bruteuser6'),
('2026-06-25 14:09:28', '185.220.101.47', 'Brute Force', 'HIGH', 'Credential Access', 'T1110.001', '5 failures in 60 seconds - Password Guessing', 'BRUTE_FORCE | HIGH | IP: 185.220.101.47 | 5 failures in 60 seconds'),
('2026-06-25 14:09:28', '185.220.101.47', 'SSH Brute Force', 'MEDIUM', 'Credential Access', 'T1110', 'SSH failure - User: bruteuser7', 'SSH_FAILURE | MEDIUM | IP: 185.220.101.47 | User: bruteuser7'),
('2026-06-25 14:09:28', '185.220.101.47', 'Brute Force', 'HIGH', 'Credential Access', 'T1110.001', '5 failures in 60 seconds - Password Guessing', 'BRUTE_FORCE | HIGH | IP: 185.220.101.47 | 5 failures in 60 seconds'),
('2026-06-25 14:09:29', '185.220.101.47', 'SSH Brute Force', 'MEDIUM', 'Credential Access', 'T1110', 'SSH failure - User: bruteuser8', 'SSH_FAILURE | MEDIUM | IP: 185.220.101.47 | User: bruteuser8'),
('2026-06-25 14:09:29', '185.220.101.47', 'Brute Force', 'HIGH', 'Credential Access', 'T1110.001', '5 failures in 60 seconds - Password Guessing', 'BRUTE_FORCE | HIGH | IP: 185.220.101.47 | 5 failures in 60 seconds'),
('2026-06-25 14:09:39', '185.220.101.47', 'UFW Block', 'MEDIUM', 'Defense Evasion', 'T1562', 'UFW block on port 21 - Impair Defenses', 'UFW_BLOCK | MEDIUM | SRC_IP: 185.220.101.47 | DPT: 21'),
('2026-06-25 14:09:39', '185.220.101.47', 'UFW Block', 'MEDIUM', 'Defense Evasion', 'T1562', 'UFW block on port 23 - Impair Defenses', 'UFW_BLOCK | MEDIUM | SRC_IP: 185.220.101.47 | DPT: 23'),
('2026-06-25 14:09:40', '185.220.101.47', 'UFW Block', 'MEDIUM', 'Defense Evasion', 'T1562', 'UFW block on port 25 - Impair Defenses', 'UFW_BLOCK | MEDIUM | SRC_IP: 185.220.101.47 | DPT: 25'),
('2026-06-25 14:09:40', '185.220.101.47', 'Port Scan', 'MEDIUM', 'Reconnaissance', 'T1046', 'Network Service Scanning', 'PORT_SCAN | MEDIUM | IP: 185.220.101.47'),
('2026-06-25 14:09:40', '185.220.101.47', 'UFW Block', 'CRITICAL', 'Defense Evasion', 'T1562', 'UFW block on port 3306 (MySQL) - Impair Defenses', 'UFW_BLOCK | CRITICAL | SRC_IP: 185.220.101.47 | DPT: 3306'),
('2026-06-25 14:09:41', '185.220.101.47', 'UFW Block', 'CRITICAL', 'Defense Evasion', 'T1562', 'UFW block on port 5432 (PostgreSQL) - Impair Defenses', 'UFW_BLOCK | CRITICAL | SRC_IP: 185.220.101.47 | DPT: 5432'),
('2026-06-25 14:09:53', '185.220.101.47', 'Firewall Block', 'LOW', 'Defense Evasion', 'T1562.004', 'Firewall block on port 135 - Disable or Modify Firewall', 'FIREWALL_BLOCK | LOW | IP: 185.220.101.47 | DPT: 135'),
('2026-06-25 14:09:54', '185.220.101.47', 'Firewall Block', 'LOW', 'Defense Evasion', 'T1562.004', 'Firewall block on port 445 (SMB) - Disable or Modify Firewall', 'FIREWALL_BLOCK | LOW | IP: 185.220.101.47 | DPT: 445'),
('2026-06-25 14:09:55', '185.220.101.47', 'Firewall Block', 'LOW', 'Defense Evasion', 'T1562.004', 'Firewall block on port 3389 (RDP) - Disable or Modify Firewall', 'FIREWALL_BLOCK | LOW | IP: 185.220.101.47 | DPT: 3389'),
('2026-06-25 14:10:06', '185.220.101.47', 'HTTP Probe', 'MEDIUM', 'Reconnaissance', 'T1595', 'Active Scanning via HTTP probe', 'HTTP_PROBE | MEDIUM | IP: 185.220.101.47'),
('2026-06-25 14:10:07', '185.220.101.47', 'HTTP Probe', 'MEDIUM', 'Reconnaissance', 'T1595', 'Active Scanning via HTTP probe', 'HTTP_PROBE | MEDIUM | IP: 185.220.101.47'),
('2026-06-25 14:10:08', '185.220.101.47', 'HTTP Probe', 'MEDIUM', 'Reconnaissance', 'T1595', 'Active Scanning via HTTP probe', 'HTTP_PROBE | MEDIUM | IP: 185.220.101.47'),
('2026-06-25 14:10:55', '185.220.101.47', 'SSH Brute Force', 'MEDIUM', 'Credential Access', 'T1110', 'SSH failure - User: admin', 'SSH_FAILURE | MEDIUM | IP: 185.220.101.47 | User: admin'),
('2026-06-25 14:10:55', '185.220.101.47', 'SSH Brute Force', 'MEDIUM', 'Credential Access', 'T1110', 'SSH failure - User: deploy', 'SSH_FAILURE | MEDIUM | IP: 185.220.101.47 | User: deploy'),
('2026-06-25 14:10:56', '185.220.101.47', 'SSH Brute Force', 'MEDIUM', 'Credential Access', 'T1110', 'SSH failure - User: ubuntu', 'SSH_FAILURE | MEDIUM | IP: 185.220.101.47 | User: ubuntu'),
('2026-06-25 14:10:57', '185.220.101.47', 'SSH Brute Force', 'MEDIUM', 'Credential Access', 'T1110', 'SSH failure - User: test', 'SSH_FAILURE | MEDIUM | IP: 185.220.101.47 | User: test'),
('2026-06-25 14:10:57', '185.220.101.47', 'SSH Brute Force', 'MEDIUM', 'Credential Access', 'T1110', 'SSH failure - User: git', 'SSH_FAILURE | MEDIUM | IP: 185.220.101.47 | User: git'),
('2026-06-25 14:10:57', '185.220.101.47', 'Brute Force', 'HIGH', 'Credential Access', 'T1110.001', '5 failures in 60 seconds - Password Guessing', 'BRUTE_FORCE | HIGH | IP: 185.220.101.47 | 5 failures in 60 seconds'),
('2026-06-25 14:11:08', '185.220.101.47', 'Privilege Escalation', 'HIGH', 'Privilege Escalation', 'T1078', 'Root attack - Valid Accounts', 'ROOT_ATTACK | HIGH | IP: 185.220.101.47 | User: root');