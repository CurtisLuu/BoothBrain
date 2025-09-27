import requests

# Test PDF page loading
file_id = "643f9ddf-5591-4ad0-968f-a388ba9d869e"
try:
    r = requests.get(f"http://localhost:8000/pdf-page/{file_id}/0", timeout=10)
    print(f"Status: {r.status_code}")
    if r.status_code == 200:
        data = r.json()
        print(f"Success! Page loaded. Image size: {len(data.get('page_image', ''))} characters")
        print(f"Page size: {data.get('page_size', {})}")
    else:
        print(f"Error: {r.text}")
except Exception as e:
    print("Error:", e)
