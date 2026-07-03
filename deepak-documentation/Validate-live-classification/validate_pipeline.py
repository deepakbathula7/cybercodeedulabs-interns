import re

MITRE_MAPPING = {
    "SSH_FAILURE": {},
    "ROOT_ATTACK": {},
    "BRUTE_FORCE": {},
    "PORT_SCAN": {},
    "UFW_BLOCK": {},
    "FIREWALL_BLOCK": {},
    "HTTP_PROBE": {},
    "SQL_INJECTION": {},
    "DDOS": {},
    "LATERAL_MOVEMENT": {},
    "PHISHING": {},
    "MALWARE": {}
}

INPUT_FILE = "module1_output.txt"

total_events = 0
mapped_events = 0
missing_events = []

print("\n=========== PIPELINE VALIDATION ===========\n")

with open(INPUT_FILE, "r", errors="ignore") as file:

    for line in file:

        line = line.strip()

        if not line:
            continue

        if (
            "SUMMARY" in line
            or "PORTS =" in line
            or "Top 3" in line
            or "Highest severity" in line
            or "Recommendation" in line
            or "Total event types" in line
        ):
            continue

        match = re.search(r"] ([A-Z_]+) \|", line)

        if not match:
            continue

        event = match.group(1)
        total_events += 1

        if event in MITRE_MAPPING:
            mapped_events += 1
            print(f"{event:<20} PASS")
        else:
            missing_events.append(event)
            print(f"{event:<20} FAIL")

print("\n------------------------------------------")
print(f"Events Checked : {total_events}")
print(f"Mapped          : {mapped_events}")
print(f"Missing         : {len(missing_events)}")

if len(missing_events) == 0:
    print("\nPIPELINE STATUS : SUCCESS")
else:
    print("\nPIPELINE STATUS : FAILED")
    print("Missing Event Types:")
    for event in sorted(set(missing_events)):
        print("-", event)
