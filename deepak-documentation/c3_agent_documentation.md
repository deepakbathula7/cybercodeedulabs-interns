# C3 Agent Documentation

## Overview

This document explains the working of c3_agent.py file.
It describes all functions, log monitoring, security detection, and heartbeat system.

---
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
