import requests
import os

# Test uploading a new PDF
test_pdf_path = "uploads/643f9ddf-5591-4ad0-968f-a388ba9d869e_INST123 - Team Contract Consolidated Version.docx.pdf"

if os.path.exists(test_pdf_path):
    with open(test_pdf_path, 'rb') as f:
        files = {'file': f}
        try:
            response = requests.post('http://localhost:8000/upload-pdf', files=files)
            print(f"Upload status: {response.status_code}")
            if response.status_code == 200:
                data = response.json()
                print(f"Upload successful: {data}")
                
                # Test loading the page
                file_id = data['file_id']
                page_response = requests.get(f'http://localhost:8000/pdf-page/{file_id}/0')
                print(f"Page load status: {page_response.status_code}")
                if page_response.status_code == 200:
                    print("Page loaded successfully!")
                else:
                    print(f"Page load error: {page_response.text}")
            else:
                print(f"Upload error: {response.text}")
        except Exception as e:
            print(f"Error: {e}")
else:
    print("Test PDF file not found")
