import requests
import json

# Test if backend is running
try:
    response = requests.get("http://localhost:8000")
    print("Backend status:", response.json())
except Exception as e:
    print("Backend not running:", e)
    exit(1)

# Test PDF page loading
file_id = "643f9ddf-5591-4ad0-968f-a388ba9d869e"
try:
    response = requests.get(f"http://localhost:8000/pdf-page/{file_id}/0")
    if response.status_code == 200:
        data = response.json()
        print(f"Success! Page loaded. Image size: {len(data.get('page_image', ''))} characters")
    else:
        print(f"Error {response.status_code}: {response.text}")
except Exception as e:
    print("Error loading page:", e)
