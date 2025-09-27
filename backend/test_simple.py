import requests

# Test basic connectivity
try:
    r = requests.get("http://localhost:8000", timeout=5)
    print("Backend is running:", r.json())
except Exception as e:
    print("Backend error:", e)
