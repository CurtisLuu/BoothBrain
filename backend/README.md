# 🐍 Backend - BoothBrain

Python backend services for PDF processing and sports analytics API.

## 🚀 Quick Start

### **Option 1: PyMuPDF Backend (Port 8000)**
```bash
# Install dependencies
pip install -r requirements.txt

# Start server
python main.py
```

### **Option 2: pdf2image Backend (Port 8001)**
```bash
# Install dependencies
pip install -r requirements_alt.txt

# Start server
python start_alt.py
```

### **Windows Quick Start**
```bash
# Run batch file
start_backend.bat
```

## 📁 Project Structure

```
backend/
├── main.py              # PyMuPDF backend (Port 8000)
├── main_alt.py          # pdf2image backend (Port 8001)
├── start.py             # PyMuPDF startup script
├── start_alt.py         # pdf2image startup script
├── requirements.txt     # PyMuPDF dependencies
├── requirements_alt.txt # pdf2image dependencies
├── uploads/             # PDF file storage
├── processed/           # Processed files
├── static/              # Static assets
├── start_backend.bat    # Windows startup script
└── README.md           # This file
```

## 🛠️ Installation

### **Prerequisites**
- Python 3.8 or higher
- pip package manager

### **PyMuPDF Backend**
```bash
pip install -r requirements.txt
```

**Dependencies:**
- `fastapi==0.104.1` - Web framework
- `uvicorn==0.24.0` - ASGI server
- `PyMuPDF==1.23.8` - PDF processing
- `Pillow==10.1.0` - Image processing
- `python-multipart==0.0.6` - File upload support
- `google-genai==0.3.0` - Gemini AI integration
- `python-dotenv==1.0.0` - Environment variable management

### **pdf2image Backend**
```bash
pip install -r requirements_alt.txt
```

**Additional Dependencies:**
- `pdf2image==1.16.3` - PDF to image conversion

### **System Dependencies (pdf2image)**
For pdf2image to work, you need poppler-utils:

**Windows:**
```bash
# Install via conda
conda install -c conda-forge poppler

# Or download from: https://github.com/oschwartz10612/poppler-windows
```

**macOS:**
```bash
brew install poppler
```

**Linux:**
```bash
sudo apt-get install poppler-utils
```

## 🔧 API Endpoints

### **Core Endpoints**
- `GET /` - Health check
- `GET /debug/files` - List loaded files
- `POST /upload-pdf` - Upload PDF file
- `GET /pdf-page/{file_id}/{page_num}` - Get PDF page as image
- `POST /add-annotations` - Save annotations
- `GET /get-annotations/{file_id}` - Retrieve annotations
- `GET /export-pdf/{file_id}` - Export modified PDF

### **NFL Expert AI Endpoints**
- `POST /ask-nfl-expert` - Ask Gemini AI NFL expert questions

### **Request/Response Examples**

#### **Upload PDF**
```bash
curl -X POST "http://localhost:8000/upload-pdf" \
  -F "file=@document.pdf"
```

**Response:**
```json
{
  "file_id": "uuid-string",
  "total_pages": 4,
  "width": 595.0,
  "height": 842.0
}
```

#### **Get PDF Page**
```bash
curl "http://localhost:8000/pdf-page/{file_id}/0"
```

**Response:**
```json
{
  "page_image": "base64-encoded-image",
  "page_size": {
    "width": 595.0,
    "height": 842.0
  }
}
```

#### **Ask NFL Expert**
```bash
curl -X POST "http://localhost:8000/ask-nfl-expert" \
  -H "Content-Type: application/json" \
  -d '{"question": "Who are the top quarterbacks this season?"}'
```

**Response:**
```json
{
  "answer": "Based on current performance and statistics...",
  "question": "Who are the top quarterbacks this season?"
}
```

## 🔄 PDF Processing Technologies

### **PyMuPDF Backend (main.py)**
- **Technology**: PyMuPDF (fitz)
- **Pros**: Fast, feature-rich
- **Cons**: May have compatibility issues with some PDFs
- **Port**: 8000

### **pdf2image Backend (main_alt.py)**
- **Technology**: pdf2image + Pillow
- **Pros**: More reliable, better compatibility
- **Cons**: Slower processing
- **Port**: 8001

## 🚨 Troubleshooting

### **Common Issues**

#### **"Orphaned Object" Error (PyMuPDF)**
- **Cause**: PDF compatibility issue
- **Solution**: Use pdf2image backend or PDF.js frontend editor

#### **Port Already in Use**
- **Solution**: Kill existing process or use different port
```bash
# Windows
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# Linux/macOS
lsof -ti:8000 | xargs kill -9
```

#### **PDF Upload Fails**
- **Check**: File size limits and format
- **Solution**: Ensure PDF is valid and not corrupted

#### **Image Rendering Issues**
- **PyMuPDF**: Try different rendering methods
- **pdf2image**: Check poppler installation

### **Debug Mode**
Enable debug logging by setting environment variable:
```bash
export DEBUG=true
python main.py
```

## 🔧 Configuration

### **Environment Variables**
Create `.env` file:
```env
UPLOAD_DIR=uploads
MAX_FILE_SIZE=10485760  # 10MB
ALLOWED_ORIGINS=http://localhost:3000
GENAI_API_KEY=your_gemini_api_key_here
```

**Required for NFL Expert AI:**
- `GENAI_API_KEY` - Your Google Gemini API key (get from [Google AI Studio](https://makersuite.google.com/app/apikey))

### **File Storage**
- **Upload Directory**: `uploads/`
- **File Naming**: `{file_id}_{original_name}.pdf`
- **Cleanup**: Manual cleanup required (auto-cleanup not implemented)

## 📊 Performance

### **Optimization Tips**
- Use appropriate image quality settings
- Implement file cleanup routines
- Add caching for frequently accessed files
- Monitor memory usage with large PDFs

### **Monitoring**
- Check server logs for errors
- Monitor disk space in uploads directory
- Track API response times

## 🔒 Security

### **Current Implementation**
- CORS enabled for frontend
- File type validation
- Basic error handling

### **Production Considerations**
- Add authentication/authorization
- Implement rate limiting
- Add input validation
- Use HTTPS
- Implement file size limits

## 🧪 Testing

### **Manual Testing**
```bash
# Test health endpoint
curl http://localhost:8000/

# Test file upload
curl -X POST "http://localhost:8000/upload-pdf" -F "file=@test.pdf"

# Test page rendering
curl "http://localhost:8000/pdf-page/{file_id}/0"
```

### **Automated Testing**
```bash
# Install test dependencies
pip install pytest httpx

# Run tests
pytest tests/
```

## 📦 Deployment

### **Production Setup**
1. **Use production WSGI server**:
   ```bash
   pip install gunicorn
   gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker
   ```

2. **Set up reverse proxy** (nginx):
   ```nginx
   location / {
       proxy_pass http://localhost:8000;
       proxy_set_header Host $host;
       proxy_set_header X-Real-IP $remote_addr;
   }
   ```

3. **Use environment variables** for configuration

### **Docker Deployment**
```dockerfile
FROM python:3.9-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .
EXPOSE 8000

CMD ["python", "main.py"]
```

## 🔄 Development

### **Adding New Endpoints**
1. Add route in `main.py` or `main_alt.py`
2. Define request/response models
3. Add error handling
4. Update documentation

### **PDF Processing Improvements**
- Add support for more PDF features
- Implement annotation persistence
- Add PDF modification capabilities
- Optimize rendering performance

## 📝 Logging

### **Log Levels**
- **INFO**: General information
- **ERROR**: Error conditions
- **DEBUG**: Detailed debugging information

### **Log Format**
```
INFO:     127.0.0.1:52254 - "GET / HTTP/1.1" 200 OK
ERROR:    Error rendering page: orphaned object: parent is None
```

---

**Backend built with Python and FastAPI** 🐍