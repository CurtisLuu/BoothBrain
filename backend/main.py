from fastapi import FastAPI, File, UploadFile, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
import fitz  # PyMuPDF
import io
import base64
import json
import os
from typing import List, Dict, Any
from pydantic import BaseModel
import uuid
from datetime import datetime

app = FastAPI(title="PDF Editor API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create directories
os.makedirs("uploads", exist_ok=True)
os.makedirs("processed", exist_ok=True)
os.makedirs("static", exist_ok=True)

# Mount static files
app.mount("/static", StaticFiles(directory="static"), name="static")

# Pydantic models
class AnnotationData(BaseModel):
    id: str
    type: str
    x: float
    y: float
    width: float = 0
    height: float = 0
    text: str = ""
    color: str = "#000000"
    size: int = 2
    page: int = 0
    points: List[Dict[str, float]] = []

class PDFEditRequest(BaseModel):
    file_id: str
    annotations: List[AnnotationData]
    page: int = 0

class PDFInfo(BaseModel):
    file_id: str
    filename: str
    total_pages: int
    page_size: Dict[str, float]
    created_at: str

# Store file info in memory (in production, use a database)
file_storage = {}

def load_existing_files():
    """Load existing files from uploads directory on startup"""
    import os
    import json
    uploads_dir = "uploads"
    if os.path.exists(uploads_dir):
        for filename in os.listdir(uploads_dir):
            if filename.endswith('.pdf'):
                # Extract file_id from filename (format: file_id_original_name.pdf)
                file_id = filename.split('_')[0]
                file_path = os.path.join(uploads_dir, filename)
                
                try:
                    # Open PDF to get info
                    pdf_doc = fitz.open(file_path)
                    page = pdf_doc[0]
                    page_rect = page.rect
                    
                    file_info = {
                        "file_id": file_id,
                        "filename": filename,
                        "file_path": file_path,
                        "total_pages": pdf_doc.page_count,
                        "page_size": {
                            "width": page_rect.width,
                            "height": page_rect.height
                        },
                        "created_at": datetime.now().isoformat()
                    }
                    
                    file_storage[file_id] = file_info
                    pdf_doc.close()
                    print(f"Loaded existing file: {file_id}")
                    
                except Exception as e:
                    print(f"Error loading file {filename}: {e}")

# Load existing files on startup
load_existing_files()

@app.get("/")
async def root():
    return {"message": "PDF Editor API is running!"}

@app.get("/debug/files")
async def debug_files():
    """Debug endpoint to see loaded files"""
    return {"loaded_files": list(file_storage.keys()), "file_count": len(file_storage)}

@app.post("/upload-pdf")
async def upload_pdf(file: UploadFile = File(...)):
    """Upload and process a PDF file"""
    try:
        # Generate unique file ID
        file_id = str(uuid.uuid4())
        
        # Read file content
        content = await file.read()
        
        # Save original file
        file_path = f"uploads/{file_id}_{file.filename}"
        with open(file_path, "wb") as f:
            f.write(content)
        
        # Open PDF with PyMuPDF
        pdf_doc = fitz.open(stream=content, filetype="pdf")
        
        # Get PDF info
        page = pdf_doc[0]  # First page
        page_rect = page.rect
        
        # Store file info
        file_info = {
            "file_id": file_id,
            "filename": file.filename,
            "file_path": file_path,
            "total_pages": pdf_doc.page_count,
            "page_size": {
                "width": page_rect.width,
                "height": page_rect.height
            },
            "created_at": datetime.now().isoformat()
        }
        file_storage[file_id] = file_info
        
        # Generate page images for preview
        page_images = []
        for page_num in range(pdf_doc.page_count):
            page = pdf_doc[page_num]
            # Render page as image
            mat = fitz.Matrix(2.0, 2.0)  # 2x zoom for better quality
            pix = page.get_pixmap(matrix=mat)
            img_data = pix.tobytes("png")
            
            # Convert to base64
            img_base64 = base64.b64encode(img_data).decode()
            page_images.append(img_base64)
        
        pdf_doc.close()
        
        return JSONResponse(content={
            "file_id": file_id,
            "filename": file.filename,
            "total_pages": file_info["total_pages"],
            "page_size": file_info["page_size"],
            "page_images": page_images,
            "message": "PDF uploaded successfully"
        })
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error processing PDF: {str(e)}")

@app.get("/pdf-info/{file_id}")
async def get_pdf_info(file_id: str):
    """Get information about an uploaded PDF"""
    if file_id not in file_storage:
        raise HTTPException(status_code=404, detail="File not found")
    
    return file_storage[file_id]

@app.get("/pdf-page/{file_id}/{page_num}")
async def get_pdf_page(file_id: str, page_num: int):
    """Get a specific page of the PDF as an image"""
    print(f"Requested file_id: {file_id}, page: {page_num}")
    print(f"Available files: {list(file_storage.keys())}")
    
    if file_id not in file_storage:
        raise HTTPException(status_code=404, detail=f"File not found. Available files: {list(file_storage.keys())}")
    
    try:
        file_info = file_storage[file_id]
        print(f"Opening file: {file_info['file_path']}")
        
        # Check if file exists
        if not os.path.exists(file_info["file_path"]):
            raise HTTPException(status_code=404, detail="PDF file not found on disk")
        
        # Try multiple approaches to open the PDF
        pdf_doc = None
        try:
            # Method 1: Direct file path
            pdf_doc = fitz.open(file_info["file_path"])
            print(f"PDF opened successfully. Pages: {pdf_doc.page_count}")
        except Exception as e1:
            print(f"Method 1 failed: {e1}")
            try:
                # Method 2: Read file content and open from memory
                with open(file_info["file_path"], "rb") as f:
                    pdf_content = f.read()
                pdf_doc = fitz.open(stream=pdf_content, filetype="pdf")
                print(f"PDF opened from memory. Pages: {pdf_doc.page_count}")
            except Exception as e2:
                print(f"Method 2 failed: {e2}")
                raise HTTPException(status_code=400, detail=f"Cannot open PDF file: {str(e1)}")
        
        if page_num >= pdf_doc.page_count:
            pdf_doc.close()
            raise HTTPException(status_code=400, detail="Page number out of range")
        
        page = pdf_doc[page_num]
        print(f"Loading page {page_num}")
        
        # Try different rendering approaches
        img_data = None
        try:
            # Method 1: High quality rendering
            mat = fitz.Matrix(2.0, 2.0)
            pix = page.get_pixmap(matrix=mat)
            img_data = pix.tobytes("png")
            print("High quality rendering successful")
        except Exception as e1:
            print(f"High quality rendering failed: {e1}")
            try:
                # Method 2: Lower quality rendering
                mat = fitz.Matrix(1.0, 1.0)
                pix = page.get_pixmap(matrix=mat)
                img_data = pix.tobytes("png")
                print("Lower quality rendering successful")
            except Exception as e2:
                print(f"Lower quality rendering failed: {e2}")
                try:
                    # Method 3: Default rendering
                    pix = page.get_pixmap()
                    img_data = pix.tobytes("png")
                    print("Default rendering successful")
                except Exception as e3:
                    print(f"Default rendering failed: {e3}")
                    pdf_doc.close()
                    raise HTTPException(status_code=400, detail=f"Cannot render PDF page: {str(e3)}")
        
        pdf_doc.close()
        
        # Return as base64
        img_base64 = base64.b64encode(img_data).decode()
        return {"page_image": img_base64, "page_size": page.rect}
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error rendering page: {str(e)}")

@app.post("/add-annotations")
async def add_annotations(request: PDFEditRequest):
    """Add annotations to a PDF page"""
    if request.file_id not in file_storage:
        raise HTTPException(status_code=404, detail="File not found")
    
    try:
        file_info = file_storage[request.file_id]
        pdf_doc = fitz.open(file_info["file_path"])
        
        if request.page >= pdf_doc.page_count:
            raise HTTPException(status_code=400, detail="Page number out of range")
        
        page = pdf_doc[request.page]
        
        # Add annotations to the page
        for annotation in request.annotations:
            if annotation.type == "text":
                # Add text annotation
                point = fitz.Point(annotation.x, annotation.y)
                text_rect = fitz.Rect(annotation.x, annotation.y - 20, annotation.x + 200, annotation.y + 10)
                page.insert_text(point, annotation.text, fontsize=annotation.size, color=annotation.color)
                
            elif annotation.type == "rectangle":
                # Add rectangle annotation
                rect = fitz.Rect(annotation.x, annotation.y, 
                               annotation.x + annotation.width, 
                               annotation.y + annotation.height)
                page.draw_rect(rect, color=annotation.color, width=annotation.size)
                
            elif annotation.type == "circle":
                # Add circle annotation
                center = fitz.Point(annotation.x + annotation.width/2, 
                                  annotation.y + annotation.height/2)
                radius = annotation.width / 2
                page.draw_circle(center, radius, color=annotation.color, width=annotation.size)
                
            elif annotation.type == "drawing":
                # Add drawing annotation (polyline)
                if len(annotation.points) > 1:
                    points = [fitz.Point(p["x"], p["y"]) for p in annotation.points]
                    page.draw_polyline(points, color=annotation.color, width=annotation.size)
        
        # Save the modified PDF
        output_path = f"processed/{request.file_id}_edited.pdf"
        pdf_doc.save(output_path)
        pdf_doc.close()
        
        return {"message": "Annotations added successfully", "output_path": output_path}
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error adding annotations: {str(e)}")

@app.get("/download-pdf/{file_id}")
async def download_pdf(file_id: str):
    """Download the edited PDF"""
    if file_id not in file_storage:
        raise HTTPException(status_code=404, detail="File not found")
    
    output_path = f"processed/{file_id}_edited.pdf"
    if not os.path.exists(output_path):
        raise HTTPException(status_code=404, detail="Edited PDF not found")
    
    return FileResponse(
        path=output_path,
        filename=f"edited_{file_storage[file_id]['filename']}",
        media_type="application/pdf"
    )

@app.post("/export-pdf")
async def export_pdf(request: PDFEditRequest):
    """Export PDF with all annotations applied"""
    if request.file_id not in file_storage:
        raise HTTPException(status_code=404, detail="File not found")
    
    try:
        file_info = file_storage[request.file_id]
        pdf_doc = fitz.open(file_info["file_path"])
        
        # Apply annotations to all pages
        for page_num in range(pdf_doc.page_count):
            page = pdf_doc[page_num]
            page_annotations = [ann for ann in request.annotations if ann.page == page_num]
            
            for annotation in page_annotations:
                if annotation.type == "text":
                    point = fitz.Point(annotation.x, annotation.y)
                    page.insert_text(point, annotation.text, fontsize=annotation.size, color=annotation.color)
                    
                elif annotation.type == "rectangle":
                    rect = fitz.Rect(annotation.x, annotation.y, 
                                   annotation.x + annotation.width, 
                                   annotation.y + annotation.height)
                    page.draw_rect(rect, color=annotation.color, width=annotation.size)
                    
                elif annotation.type == "circle":
                    center = fitz.Point(annotation.x + annotation.width/2, 
                                      annotation.y + annotation.height/2)
                    radius = annotation.width / 2
                    page.draw_circle(center, radius, color=annotation.color, width=annotation.size)
                    
                elif annotation.type == "drawing":
                    if len(annotation.points) > 1:
                        points = [fitz.Point(p["x"], p["y"]) for p in annotation.points]
                        page.draw_polyline(points, color=annotation.color, width=annotation.size)
        
        # Save the final PDF
        output_path = f"processed/{request.file_id}_final.pdf"
        pdf_doc.save(output_path)
        pdf_doc.close()
        
        return FileResponse(
            path=output_path,
            filename=f"edited_{file_info['filename']}",
            media_type="application/pdf"
        )
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error exporting PDF: {str(e)}")

@app.delete("/pdf/{file_id}")
async def delete_pdf(file_id: str):
    """Delete uploaded PDF and related files"""
    if file_id not in file_storage:
        raise HTTPException(status_code=404, detail="File not found")
    
    try:
        file_info = file_storage[file_id]
        
        # Delete files
        if os.path.exists(file_info["file_path"]):
            os.remove(file_info["file_path"])
        
        output_path = f"processed/{file_id}_edited.pdf"
        if os.path.exists(output_path):
            os.remove(output_path)
        
        final_path = f"processed/{file_id}_final.pdf"
        if os.path.exists(final_path):
            os.remove(final_path)
        
        # Remove from storage
        del file_storage[file_id]
        
        return {"message": "PDF deleted successfully"}
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error deleting PDF: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
