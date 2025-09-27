# PDF Editor Backend Setup Guide

## 🚀 Quick Start

### 1. Install Python (if not already installed)
- Download Python 3.8+ from https://python.org
- Make sure to check "Add Python to PATH" during installation

### 2. Install Backend Dependencies
```bash
cd backend
pip install -r requirements.txt
```

### 3. Start the Backend Server
```bash
python start.py
```

Or on Windows, double-click `start_backend.bat`

### 4. Start the Frontend
```bash
npm start
```

## 🔧 What This Backend Provides

### ✅ **Real PDF Processing**
- **Actual PDF Content**: Loads and displays real PDF pages
- **High-Quality Rendering**: Converts PDF pages to high-resolution images
- **Multi-page Support**: Navigate through all pages
- **Zoom Controls**: Scale pages for detailed editing

### ✅ **Professional PDF Editing**
- **Text Annotations**: Add text directly to PDF
- **Shape Drawing**: Rectangles, circles, lines
- **Freehand Drawing**: Pen tool with custom colors/sizes
- **Highlighting**: Transparent highlighting
- **Sticky Notes**: Movable annotation notes

### ✅ **Backend Features**
- **File Management**: Upload, store, and manage PDFs
- **Annotation Storage**: Save annotations to server
- **PDF Export**: Generate edited PDFs with annotations
- **REST API**: Clean API for frontend integration

## 🎯 **Why Backend is Better**

### **Frontend-Only Limitations**
- ❌ Can't modify actual PDF content
- ❌ Limited to annotation overlays
- ❌ Memory issues with large files
- ❌ No real PDF processing

### **Backend Advantages**
- ✅ **Real PDF Editing**: Modify actual PDF content
- ✅ **Professional Quality**: High-resolution rendering
- ✅ **Scalable**: Handle large files efficiently
- ✅ **Reliable**: Robust PDF processing with PyMuPDF
- ✅ **Export**: Generate proper PDF files

## 🛠 **Technical Details**

### **Backend Stack**
- **FastAPI**: Modern Python web framework
- **PyMuPDF (fitz)**: Professional PDF processing
- **Pillow**: Image processing and manipulation
- **Uvicorn**: High-performance ASGI server

### **API Endpoints**
- `POST /upload-pdf` - Upload PDF files
- `GET /pdf-page/{file_id}/{page}` - Get page as image
- `POST /add-annotations` - Save annotations
- `POST /export-pdf` - Export edited PDF
- `GET /download-pdf/{file_id}` - Download result

### **File Flow**
1. **Upload**: PDF → Backend → Stored + Processed
2. **Edit**: Frontend → Backend API → Real-time updates
3. **Save**: Annotations → Backend → Stored
4. **Export**: Backend → Modified PDF → Download

## 🚨 **Troubleshooting**

### **Backend Won't Start**
```bash
# Check Python version
python --version

# Install dependencies
pip install -r backend/requirements.txt

# Start manually
cd backend
python main.py
```

### **Frontend Can't Connect**
- Make sure backend is running on http://localhost:8000
- Check browser console for CORS errors
- Verify API_BASE URL in BackendPDFEditor.js

### **PDF Upload Issues**
- Check file size (backend handles large files)
- Ensure PDF is not corrupted
- Check backend logs for errors

## 📁 **File Structure**
```
football.ai/
├── backend/                 # Python backend
│   ├── main.py             # FastAPI app
│   ├── start.py            # Startup script
│   ├── requirements.txt    # Dependencies
│   ├── uploads/            # Uploaded PDFs
│   └── processed/          # Edited PDFs
├── src/components/
│   ├── BackendPDFEditor.js # Backend-powered editor
│   └── ImportPage.js       # Updated to use backend
└── start_backend.bat       # Windows startup script
```

## 🎉 **Ready to Use!**

Once both backend and frontend are running:
1. Go to http://localhost:3000
2. Navigate to Import page
3. Upload a PDF file
4. Click "Edit PDF" to open the backend-powered editor
5. Edit with real PDF content and professional tools
6. Save and export your edited PDF!

The backend provides a much more robust and professional PDF editing experience compared to frontend-only solutions.
