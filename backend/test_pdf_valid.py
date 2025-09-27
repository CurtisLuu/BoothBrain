import fitz
import os

# Test if the PDF file is valid
file_path = "uploads/643f9ddf-5591-4ad0-968f-a388ba9d869e_INST123 - Team Contract Consolidated Version.docx.pdf"

print(f"File exists: {os.path.exists(file_path)}")
print(f"File size: {os.path.getsize(file_path) if os.path.exists(file_path) else 'N/A'} bytes")

try:
    doc = fitz.open(file_path)
    print(f"PDF opened successfully")
    print(f"Page count: {doc.page_count}")
    print(f"Is PDF: {doc.is_pdf}")
    print(f"Is encrypted: {doc.is_encrypted}")
    
    # Try to get first page
    page = doc[0]
    print(f"First page rect: {page.rect}")
    
    # Try to render
    mat = fitz.Matrix(1.0, 1.0)  # Low resolution
    pix = page.get_pixmap(matrix=mat)
    print(f"Pixmap created successfully: {pix.width}x{pix.height}")
    
    doc.close()
    print("PDF test successful!")
    
except Exception as e:
    print(f"Error: {e}")
    print(f"Error type: {type(e)}")
