import requests
from requests.exceptions import RequestException

BASE_URL = "https://api.cybercodeedulabs.com"
TIMEOUT = 10
results = []

test_cases = [
    {"method": "GET", "endpoint": "/healthz", "expected": 200},
    {"method": "GET", "endpoint": "/courses", "expected": 200},
    {"method": "GET", "endpoint": "/api/testimonials", "expected": 200},
    {"method": "POST","endpoint": "/api/contact","expected": 200,"payload": {"name": "Test User","email": "test@test.com", "message": "Automated API Testing"}},
    {"method": "GET","endpoint": "/api/admin/health","expected": [401, 403]}
]

def test_api(session, test):
    url = BASE_URL + test["endpoint"]
    try:
        response = session.request(
            method=test["method"],
            url=url,
            json=test.get("payload"),
            timeout=TIMEOUT
        )
        status_code = response.status_code
        if isinstance(test["expected"], list):
            assert status_code in test["expected"], f"Expected one of {test['expected']}, but got {status_code}"
        else:
            assert status_code == test["expected"], f"Expected {test['expected']}, but got {status_code}"
        result = "PASS"
    except AssertionError:
        status_code = response.status_code
        result = "FAIL"
    except RequestException:
        status_code = "ERROR"
        result = "FAIL"
    results.append({
        "Endpoint": test["endpoint"],
        "Status Code": status_code,
        "Expected": test["expected"],
        "Result": result
    })

def print_summary():
    print("\n" + "=" * 90)
    print(f"{'Endpoint':35}{'Status Code':15}{'Expected':20}{'Pass/Fail'}")
    print("=" * 90)
    passed = 0
    for result in results:
        print(
            f"{result['Endpoint']:35}"
            f"{str(result['Status Code']):15}"
            f"{str(result['Expected']):20}"
            f"{result['Result']}"
        )
        if result["Result"] == "PASS":
            passed += 1
    print("=" * 90)
    print(f"Total Tests : {len(results)}")
    print(f"Passed      : {passed}")
    print(f"Failed      : {len(results)-passed}")
    print("=" * 90)

def main():
    session = requests.Session()
    session.headers.update({"Content-Type": "application/json"})
    for test in test_cases:
        test_api(session, test)
    print_summary()

if __name__ == "__main__":
    main()
