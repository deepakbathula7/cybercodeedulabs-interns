# C3 Agent Documentation

## Overview

This document explains the working of c3_agent.py file.
It describes all functions, log monitoring, security detection, and heartbeat system.

---

# Functions

## Function: get_server_ip()

### What it does

This function determines the IP address of the server running the C3 Agent. It attempts multiple methods to find a valid network IP address, including using a socket connection, hostname resolution, and parsing network interface information. If all methods fail, it returns the localhost address as a fallback.

### Parameters

None.

### Returns

A string containing the server's IP address.

### Example

**Input:**

None

**Output:**

```text
192.168.1.10
```

If no valid network IP can be found:

```text
127.0.0.1
```

---

## Function: get_server_hostname()

### What it does

This function retrieves the hostname of the server on which the C3 Agent is running. The hostname is used to identify the machine when sending monitoring events to the central platform. If the hostname cannot be determined, the function returns `"unknown"`.

### Parameters

None.

### Returns

A string containing the server hostname.

### Example

**Input:**

None

**Output:**

```text
web-server-01
```

If hostname lookup fails:

```text
unknown
```

---

## Function: check_brute_force(src_ip)

### What it does

This function tracks failed login attempts from a specific IP address. If more than 5 attempts occur within 60 seconds, it flags the IP as a brute-force attacker.

### Parameters

* `src_ip` (string): The IP address being checked

### Returns

* `True` if brute-force attack is detected
* `False` otherwise

### Example

**Input:**

```text
check_brute_force("192.168.1.5")
```

**Output:**

```text
False
```

---

## Function: enrich(event)

### What it does

This function adds additional metadata to every security event, including server IP, hostname, and UTC timestamp. It ensures all events sent to the API are standardized.

### Parameters

* `event` (dictionary): Security event data

### Returns

* Enriched event dictionary with added fields

### Example

**Input:**

```json
{"type": "ssh_failure"}
```

**Output:**

```json
{
  "type": "ssh_failure",
  "server_ip": "192.168.1.10",
  "server_hostname": "server-01",
  "timestamp": "2026-01-01T12:00:00Z"
}
```

---

## Function: parse_auth_log(line)

### What it does

Parses authentication logs (`auth.log`) to detect SSH failures, brute-force attacks, invalid users, root login attempts, sudo misuse, and successful logins.

### Parameters

* `line` (string): A single log line from auth.log

### Returns

* Dictionary describing detected security event
* `None` if no event is detected

### Example

**Input:**

```text
Failed password for root from 1.2.3.4
```

**Output:**

```json
{
  "type": "root_attack",
  "src_ip": "1.2.3.4",
  "username": "root",
  "severity": "HIGH",
  "source": "auth.log",
  "raw": "Failed password for root..."
}
```

---

## Function: parse_nginx_log(line)

### What it does

Analyzes nginx access logs to detect multiple types of web-based attacks and suspicious activity, including:

- SQL injection attempts (e.g., `OR 1=1`, `UNION SELECT`)
- Web scanning tools via User-Agent fingerprinting (checks request User-Agent string for known tools like nikto, sqlmap, nmap, gobuster, wfuzz, burpsuite, nuclei)
- Path traversal attacks using `../` or encoded patterns like `%2e%2e`
- Suspicious HTTP status codes such as **400, 403, 404, 429**

These detections help identify attackers probing or exploiting web applications.


### Parameters

* `line (string)`: A single log entry from `nginx/access.log`

### Returns

* **Dictionary (event object)** if a threat is detected  
* **None** if the request is normal


### Example

**Input:**

```text
1.2.3.4 - - [..] "GET /index.php?id=1 OR 1=1 HTTP/1.1"
````

**Output:**

```json
{
  "type": "sqli_attempt",
  "src_ip": "1.2.3.4",
  "dst_port": 80,
  "dst_service": "http",
  "severity": "HIGH",
  "source": "nginx/access.log",
  "raw": "..."
}
```


---

## Function: parse_ufw_log(line)

### What it does

Detects firewall activity from UFW logs such as blocked connections and port scanning attempts.

### Parameters

* `line` (string)

### Returns

* Dictionary or `None`

### Example

**Input:**

```text
[UFW BLOCK] SRC=1.2.3.4 DPT=22
```

**Output:**

```json
{
  "type": "port_scan",
  "src_ip": "1.2.3.4",
  "dst_port": 22
}
```

---

## Function: parse_syslog(line)

### What it does

Detects system-level anomalies from syslog including:

- Firewall blocks using UFW BLOCK events
- Suspicious process execution activity from `/tmp`
- Execution-related syscall indicators such as `exec`, `spawn`, `fork`, and `EXECVE`

These patterns help identify unauthorized system-level execution and potential exploitation attempts.

### Parameters

* `line` (string)

### Returns

* Dictionary or `None`

---

## Function: parse_line(filepath, line)

### What it does

Routes each log line to the correct parser based on the file type:

* auth.log → authentication parsing
* nginx logs → web attack detection
* ufw logs → firewall detection
* syslog → system anomaly detection

### Parameters

* `filepath` (string)
* `line` (string)

### Returns

* Dictionary or `None`

---

## Function: tail_file(filepath, stop_event)

### What it does

Continuously monitors log files in real-time. It also handles log rotation by reopening files automatically when they are rotated or replaced.

### Parameters

* `filepath` (string)
* `stop_event` (threading.Event)

### Returns

None (runs continuously)

---

## Function: send_heartbeat(stop_event)

### What it does

Sends periodic heartbeat signals to confirm that the agent is alive and running.

### Parameters

* `stop_event`

### Returns

None

### Example

```json
{
  "type": "heartbeat",
  "severity": "LOW"
}
```

---

## Function: send_events(api_url, api_key, stop_event)

### What it does

Sends collected security events to the monitoring API in batches. If sending fails, events are retried.

### Parameters

* `api_url` (string)
* `api_key` (string)
* `stop_event`

### Returns

None

---

## Function: main()

### What it does

This is the entry point of the agent. It:

* Reads command line arguments
* Validates API key
* Starts threads for:

  * log monitoring
  * heartbeat
  * event sending

### Parameters

None

### Returns

None

---

## **Log Files Monitored and Why Each One Matters**

The C3 Agent monitors four critical system and application log files. Each log provides visibility into a different layer of the system, helping the agent detect security threats across authentication, system activity, web traffic, and firewall events.


## 1. `/var/log/auth.log`

### What it contains
Authentication-related events such as SSH logins, login failures, and sudo attempts.

### Why it matters
This is the **primary security log** used to detect:
- Failed SSH login attempts
- Invalid user attacks
- Brute force attacks
- Unauthorized root access attempts


## 2. `/var/log/syslog`

### What it contains
General system-level logs including service activity, process execution, and kernel/system events.

### Why it matters
It helps detect:
- Process anomalies
- Suspicious system behavior
- Unexpected service failures
- Hidden execution activity


## 3. `/var/log/nginx/access.log`

### What it contains
All incoming HTTP/HTTPS web requests handled by the Nginx web server.

### Why it matters
It is used to detect web-based attacks such as:
- SQL injection attempts
- Web scanning tools (nmap, sqlmap, nikto)
- Suspicious URL patterns
- Path traversal attacks
- Abnormal HTTP status codes


## 4. `/var/log/ufw.log`

### What it contains
Firewall logs generated by UFW (Uncomplicated Firewall).

### Why it matters
It helps identify network-level threats such as:
- Port scanning attempts
- Blocked inbound connections
- Unauthorized access attempts
- Suspicious network probing


## Summary

Each log file represents a different security layer:

- auth.log → Authentication security
- syslog → System behavior monitoring
- nginx/access.log → Web application security
- ufw.log → Network and firewall security

Together, they provide complete visibility into system security activity.

---

## **Brute Force Threshold (5 attempts in 60 seconds)**


The brute force threshold defines how many failed login attempts from a single IP address are allowed within a fixed time window before the system classifies it as a brute force attack.


### Configuration

- **Threshold:** 5 failed attempts  
- **Time Window:** 60 seconds  


### What it means

If a single IP address fails to log in 5 or more times within 60 seconds, the system assumes that the activity is not normal user behavior and flags it as a brute force attack.


### Why 5 attempts?

The value **5** is chosen because:

- Normal users rarely fail more than 2–3 times in a short period
- Attackers use automated tools that generate repeated rapid attempts
- 5 attempts is a balanced threshold that reduces false positives while still detecting real attacks


### Why 60 seconds?

The 60-second window is used because:

- It is short enough to detect fast automated attacks
- It avoids counting old failures that are no longer relevant
- It provides a realistic timeframe for login behavior analysis


### Detection Rule

If:

```text 
failed_attempts(IP) ≥ 5 within 60 seconds
```

Then:

```text 
Result → brute_force attack detected
Severity → HIGH
```

## Summary

The brute force threshold (5 attempts in 60 seconds) is designed to detect automated login attacks while minimizing false alerts from normal user mistakes.

---

## **What is a Heartbeat Event and Why It Is Needed**

A heartbeat event is a periodic signal sent by the C3 Agent to the monitoring system to confirm that the agent is running and active. It acts as a continuous “alive status” indicator for the backend system.


### What is a Heartbeat Event

A heartbeat event is a structured message generated by the agent at regular intervals. It contains basic system information such as:

- Event type (`heartbeat`)
- Server IP address
- Hostname
- Timestamp
- Status metadata

Example:

```json
{
  "type": "heartbeat",
  "severity": "LOW",
  "server_ip": "192.168.1.10",
  "server_hostname": "server-01",
  "timestamp": "2026-01-01T12:00:00Z"
}
```

### **Why it is needed**

### 1. System health monitoring

It confirms that the agent is running properly without crashes or failures.


### 2. Failure detection

If heartbeat events stop appearing, it indicates:

* agent crash
* network failure
* system downtime


### 3. Real-time monitoring

It allows the backend system to continuously track server availability.


### 4. Reliability check

Ensures that security monitoring is active 24/7 without silent failures.


### How it works in the agent

* `send_heartbeat()` runs in a separate thread
* Executes every 10 seconds
* Generates a heartbeat event
* Adds it to `event_queue`
* Sent to API using `send_events()`

---

## Summary

A heartbeat event is a periodic “I am alive” signal from the agent. It is needed to ensure system reliability, detect failures early, and maintain continuous monitoring of the server.

---

## **Why the Agent Runs as Root**

The C3 Agent runs with root privileges because it needs access to protected system log files that are not readable by normal users. These logs are essential for detecting security threats in real time.


### Overview

The agent is a system-level security monitoring tool. It continuously reads logs from different parts of the operating system and analyzes them for suspicious activity. Many of these logs are restricted and can only be accessed by the root user.



### Why root access is required

The agent needs elevated privileges to read and monitor the following files:

- `/var/log/auth.log` → SSH login attempts and authentication events  
- `/var/log/syslog` → system-level processes and anomalies  
- `/var/log/nginx/access.log` → web traffic and attack detection  
- `/var/log/ufw.log` → firewall blocks and port scanning activity  

Without root access, the agent would not be able to read these files.


### What happens without root

If the agent is not run as root:

- Permission denied errors occur
- Log files cannot be accessed
- Security monitoring becomes incomplete
- Attack detection fails silently


### Security reasoning

Even though root access is powerful, it is justified because:

- The agent is a trusted system process
- It only reads logs (not modifying system files)
- It is designed for security monitoring
- It requires full visibility of system activity


## Summary

The C3 Agent runs as root because it needs unrestricted read access to critical system and security logs. Without root privileges, it cannot properly monitor or detect security threats.

---

# tail_file Function and Log Rotation Fix

The `tail_file` function is responsible for real-time monitoring of log files. It continuously reads new log entries as they are written, similar to the Linux command `tail -f`. It has been improved to handle log rotation safely, ensuring uninterrupted monitoring even when log files are replaced by the operating system.


### Overview

The function runs in an infinite loop and watches log files such as:
- auth.log
- syslog
- nginx/access.log
- ufw.log

It reads each new line, processes it through the parser system, and sends detected events to the event queue.


### How it works

- Opens the log file in read mode
- Moves file pointer to the end to avoid old logs
- Continuously reads new lines
- Sends each line to `parse_line()`
- If an event is detected, it is enriched and queued for sending


### **Log Rotation Problem (Old Issue)**

In Linux systems, log files are automatically rotated:
- Old log files are renamed (e.g., auth.log → auth.log.1)
- New log files are created with the same name

### Problem in older versions:
- The file handle became invalid after rotation
- `tail_file` stopped reading new logs
- Monitoring silently broke until agent restart

This created a serious blind spot in security detection.


### **Rotation Fix (v1.2.0)**

The issue was fixed using two key improvements:

### 1. Continuous loop recovery
The function is wrapped inside a loop so it can reopen the file automatically after rotation.

### 2. Inode-based detection
The system checks if the file inode has changed:

- If inode changes → file has been rotated
- The function breaks the current loop
- The new file is reopened automatically


### Result after fix

- Continuous log monitoring without interruption
- No manual restart required after rotation
- No missed security events
- Fully reliable 24/7 monitoring
 

## Summary

The `tail_file` function ensures real-time log monitoring, while the rotation fix guarantees that monitoring continues even when the operating system rotates log files. This makes the agent stable and production-ready.

---

# Brute Force Counter Logic

The brute force counter logic is used to detect repeated failed login attempts from the same IP address within a short time window. If an IP exceeds the allowed number of failures, it is flagged as a brute force attacker.


### How it works

The system maintains a dictionary called `ssh_failures` that stores timestamps of failed login attempts for each IP address.

When a login failure occurs:

1. The current timestamp is recorded  
2. Old timestamps outside the time window are removed  
3. The new timestamp is added to the IP’s record  
4. Total recent failures are counted  
5. If the count exceeds the threshold, it is marked as an attack  


### Configuration

- **Threshold:** 5 failed attempts  
- **Time Window:** 60 seconds  


### Detection Logic

If an IP has:

```text
5 or more failed login attempts within 60 seconds
```

Then it is classified as a brute force attack.


### Code logic

```python
def check_brute_force(src_ip):
    now = time.time()

    times = [
        t for t in ssh_failures[src_ip]
        if now - t < BRUTE_WINDOW
    ]

    times.append(now)
    ssh_failures[src_ip] = times

    return len(times) >= BRUTE_THRESHOLD
```

### Output

* `True` → Brute force attack detected
* `False` → Normal login behavior

## Example

If an IP generates multiple failed logins rapidly:

```text
Attempt 1
Attempt 2
Attempt 3
Attempt 4
Attempt 5 (within 60 seconds)
```

Then:

```text
Result: True → Brute force detected
```

## Summary

The brute force counter logic tracks failed login attempts per IP using timestamps and detects automated attacks when failures exceed 5 attempts within 60 seconds.

---

# Heartbeat Mechanism

The C3 Agent includes a heartbeat system to continuously confirm that the agent is alive and functioning. It periodically sends a lightweight event to the monitoring API so the backend can track system health in real time.


### How it works

The `send_heartbeat(stop_event)` function runs in a separate thread and executes in an infinite loop. At fixed time intervals, it generates a heartbeat event containing basic system identity information and adds it to the event queue.

The heartbeat event is then sent to the server along with other security events using the same batching system.


### Frequency

- Heartbeat interval: **10 seconds** (`HEARTBEAT_EVERY = 10`)

### Event Structure

Each heartbeat event includes:

- Event type: `heartbeat`
- Severity: `LOW`
- Server IP address
- Server hostname
- Timestamp (UTC)
- Raw status message

### Purpose

The heartbeat mechanism ensures:

- The agent is running without interruption
- The server is still actively monitored
- Failures or crashes are detected quickly
- Backend can show real-time system health status

### Example Output

```json
{
  "type": "heartbeat",
  "severity": "LOW",
  "server_ip": "192.168.1.10",
  "server_hostname": "server-01",
  "timestamp": "2026-01-01T12:00:00Z",
  "raw": "C3 Agent heartbeat — server-01 (192.168.1.10)"
}
```

## Summary

The heartbeat system acts as a continuous “alive signal” from the agent. If heartbeat events stop appearing, it indicates that the agent or server may be down or experiencing issues.

---

# send_events Batching Mechanism

The `send_events` function is responsible for sending collected security events from the C3 Agent to the monitoring API. It uses batching to group multiple events into a single request, improving performance and reducing network overhead.


### How it works

The agent does not send events one by one. Instead, it:

1. Collects events in a shared `event_queue`  
2. Waits for a fixed interval (5 seconds)  
3. Extracts up to 20 events at a time (batch)  
4. Sends them in a single API request  
5. Removes sent events from the queue  


### Batch Configuration

- **Batch size:** 20 events  
- **Send interval:** 5 seconds  


### Flow of execution

```text 
Event generated → event_queue
        ↓
send_events() collects up to 20 events
        ↓
Batch is created
        ↓
Sent to API in one request
        ↓
Success → removed from queue
Failure → re-added for retry
```


### **Why batching is used**

### 1. Performance optimization

Reduces number of API calls.


### 2. Network efficiency

Sends multiple events in a single request instead of many small requests.


### 3. Scalability

Handles high volume of security events without overloading the server.


### 4. Reliability

If sending fails:

* batch is re-added to queue
* retry happens automatically


### **Error handling**

* **500 server error:** batch is retried
* **network failure:** batch is re-queued
* **partial failure:** no data loss

## Summary

The `send_events` batching system improves efficiency by grouping multiple security events into batches of 20 and sending them every 5 seconds. This ensures fast, reliable, and scalable event delivery to the monitoring API.

---
