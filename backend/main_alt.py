from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import JSONResponse, StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pdf2image import convert_from_path, convert_from_bytes
from PIL import Image
import io
import base64
import json
import os
import uuid
from datetime import datetime
from typing import List, Dict, Any
from pydantic import BaseModel

app = FastAPI(title="PDF Editor API (Alternative)", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Models
class AnnotationData(BaseModel):
    id: str
    type: str
    page: int
    x: float
    y: float
    width: float = 0
    height: float = 0
    color: str = "#FF0000"
    size: float = 2
    text: str = ""

class PDFInfo(BaseModel):
    file_id: str
    filename: str
    total_pages: int
    page_size: Dict[str, float]
    created_at: str

# Store file info in memory
file_storage = {}

def load_existing_files():
    """Load existing files from uploads directory on startup"""
    uploads_dir = "uploads"
    if os.path.exists(uploads_dir):
        for filename in os.listdir(uploads_dir):
            if filename.endswith('.pdf'):
                file_id = filename.split('_')[0]
                file_path = os.path.join(uploads_dir, filename)
                
                try:
                    # Get PDF info using pdf2image
                    images = convert_from_path(file_path, first_page=1, last_page=1)
                    if images:
                        page_size = {
                            "width": images[0].width,
                            "height": images[0].height
                        }
                        
                        # Get total pages by converting all pages
                        all_images = convert_from_path(file_path)
                        total_pages = len(all_images)
                        
                        file_info = {
                            "file_id": file_id,
                            "filename": filename,
                            "file_path": file_path,
                            "total_pages": total_pages,
                            "page_size": page_size,
                            "created_at": datetime.now().isoformat()
                        }
                        
                        file_storage[file_id] = file_info
                        print(f"Loaded existing file: {file_id}")
                        
                except Exception as e:
                    print(f"Error loading file {filename}: {e}")

# Load existing files on startup
load_existing_files()

@app.get("/")
async def root():
    return {"message": "PDF Editor API (Alternative) is running!"}

@app.get("/debug/files")
async def debug_files():
    """Debug endpoint to see loaded files"""
    return {"loaded_files": list(file_storage.keys()), "file_count": len(file_storage)}

@app.post("/upload-pdf")
async def upload_pdf(file: UploadFile = File(...)):
    """Upload and process a PDF file using pdf2image"""
    try:
        file_id = str(uuid.uuid4())
        file_path = f"uploads/{file_id}_{file.filename}"
        
        # Save file
        with open(file_path, "wb") as f:
            content = await file.read()
            f.write(content)
        
        # Convert PDF to images to get info
        try:
            # Get first page for dimensions
            images = convert_from_bytes(content, first_page=1, last_page=1)
            if not images:
                raise HTTPException(status_code=400, detail="Cannot process PDF file")
            
            page_size = {
                "width": images[0].width,
                "height": images[0].height
            }
            
            # Get total pages
            all_images = convert_from_bytes(content)
            total_pages = len(all_images)
            
        except Exception as e:
            os.remove(file_path)
            raise HTTPException(status_code=400, detail=f"Error processing PDF: {str(e)}")
        
        # Store file info
        file_info = {
            "file_id": file_id,
            "filename": file.filename,
            "file_path": file_path,
            "total_pages": total_pages,
            "page_size": page_size,
            "created_at": datetime.now().isoformat()
        }
        
        file_storage[file_id] = file_info
        
        return JSONResponse({
            "file_id": file_id,
            "total_pages": total_pages,
            "width": page_size["width"],
            "height": page_size["height"]
        })
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error uploading PDF: {str(e)}")

@app.get("/pdf-page/{file_id}/{page_num}")
async def get_pdf_page(file_id: str, page_num: int):
    """Get a specific page of the PDF as an image using pdf2image"""
    print(f"Requested file_id: {file_id}, page: {page_num}")
    print(f"Available files: {list(file_storage.keys())}")
    
    if file_id not in file_storage:
        raise HTTPException(status_code=404, detail=f"File not found. Available files: {list(file_storage.keys())}")
    
    try:
        file_info = file_storage[file_id]
        print(f"Opening file: {file_info['file_path']}")
        
        if not os.path.exists(file_info["file_path"]):
            raise HTTPException(status_code=404, detail="PDF file not found on disk")
        
        # Convert specific page to image
        images = convert_from_path(
            file_info["file_path"], 
            first_page=page_num + 1,  # pdf2image uses 1-based indexing
            last_page=page_num + 1,
            dpi=200  # Good quality
        )
        
        if not images:
            raise HTTPException(status_code=400, detail="Cannot convert PDF page to image")
        
        # Convert PIL image to base64
        img = images[0]
        img_buffer = io.BytesIO()
        img.save(img_buffer, format='PNG')
        img_data = img_buffer.getvalue()
        img_base64 = base64.b64encode(img_data).decode()
        
        return {
            "page_image": img_base64, 
            "page_size": {
                "width": img.width,
                "height": img.height
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error rendering page: {str(e)}")

@app.post("/add-annotations")
async def add_annotations(file_id: str, annotations: List[AnnotationData]):
    """Add annotations to a PDF file"""
    if file_id not in file_storage:
        raise HTTPException(status_code=404, detail="File not found")
    
    # Store annotations (in production, save to database)
    file_storage[file_id]["annotations"] = [ann.dict() for ann in annotations]
    
    return {"message": "Annotations saved successfully"}

@app.get("/get-annotations/{file_id}")
async def get_annotations(file_id: str):
    """Get annotations for a PDF file"""
    if file_id not in file_storage:
        raise HTTPException(status_code=404, detail="File not found")
    
    annotations = file_storage[file_id].get("annotations", [])
    return {"annotations": annotations}

@app.get("/export-pdf/{file_id}")
async def export_pdf(file_id: str):
    """Export PDF with annotations (placeholder)"""
    if file_id not in file_storage:
        raise HTTPException(status_code=404, detail="File not found")
    
    # In a real implementation, you would:
    # 1. Load the original PDF
    # 2. Add annotations as overlays
    # 3. Return the modified PDF
    
    return {"message": "PDF export not implemented yet"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
