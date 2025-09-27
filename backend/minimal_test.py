import requests
import json

# Test 1: Basic connectivity
print("Testing basic connectivity...")
try:
    r = requests.get("http://localhost:8000", timeout=5)
    print(f"✓ Backend running: {r.json()}")
except Exception as e:
    print(f"✗ Backend error: {e}")
    exit(1)

# Test 2: Check loaded files
print("\nTesting loaded files...")
try:
    r = requests.get("http://localhost:8000/debug/files", timeout=5)
    data = r.json()
    print(f"✓ Loaded files: {data}")
except Exception as e:
    print(f"✗ Debug error: {e}")

# Test 3: Try to load a specific page
print("\nTesting PDF page loading...")
file_id = "643f9ddf-5591-4ad0-968f-a388ba9d869e"
try:
    r = requests.get(f"http://localhost:8000/pdf-page/{file_id}/0", timeout=10)
    print(f"Status: {r.status_code}")
    if r.status_code == 200:
        data = r.json()
        print(f"✓ Page loaded successfully! Image size: {len(data.get('page_image', ''))}")
    else:
        print(f"✗ Page load failed: {r.text}")
except Exception as e:
    print(f"✗ Page load error: {e}")
