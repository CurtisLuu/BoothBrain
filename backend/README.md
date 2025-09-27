# PDF Editor Backend

A Python FastAPI backend for PDF processing and editing using PyMuPDF (fitz).

## Features

- **PDF Upload**: Upload and process PDF files
- **Page Rendering**: Convert PDF pages to high-quality images
- **Annotation Support**: Add text, shapes, drawings to PDFs
- **Real PDF Editing**: Modify actual PDF content (not just overlays)
- **Export**: Download edited PDFs with annotations

## Setup

### 1. Install Python Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Start the Backend Server

```bash
python start.py
```

Or on Windows:
```bash
start_backend.bat
```

The server will be available at:
- **API**: http://localhost:8000
- **Documentation**: http://localhost:8000/docs
- **Interactive API**: http://localhost:8000/redoc

## API Endpoints

### Upload PDF
```
POST /upload-pdf
Content-Type: multipart/form-data
Body: file (PDF file)
```

### Get PDF Info
```
GET /pdf-info/{file_id}
```

### Get PDF Page
```
GET /pdf-page/{file_id}/{page_num}
```

### Add Annotations
```
POST /add-annotations
Content-Type: application/json
Body: {
  "file_id": "string",
  "annotations": [...],
  "page": 0
}
```

### Export PDF
```
POST /export-pdf
Content-Type: application/json
Body: {
  "file_id": "string",
  "annotations": [...],
  "page": 0
}
```

### Download PDF
```
GET /download-pdf/{file_id}
```

## Technology Stack

- **FastAPI**: Modern Python web framework
- **PyMuPDF (fitz)**: PDF processing and manipulation
- **Pillow**: Image processing
- **Uvicorn**: ASGI server

## File Structure

```
backend/
├── main.py              # FastAPI application
├── start.py             # Startup script
├── requirements.txt     # Python dependencies
├── uploads/            # Uploaded PDF files
├── processed/          # Processed/edited PDFs
└── static/             # Static files
```

## Development

The backend runs with auto-reload enabled, so changes to the code will automatically restart the server.

## Production Deployment

For production, consider:
- Using a production ASGI server like Gunicorn
- Setting up proper file storage (S3, etc.)
- Adding authentication and authorization
- Implementing rate limiting
- Adding logging and monitoring
