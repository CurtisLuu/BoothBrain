# 🏈 Football AI - Advanced Sports Analytics Platform

A comprehensive sports analytics platform featuring team management, game statistics, schedule tracking, and advanced PDF editing capabilities.

## 🚀 Features

### 📊 **Core Features**
- **Team Management**: Comprehensive team rosters and statistics
- **Game Statistics**: Detailed game analysis and performance metrics
- **Schedule Management**: Interactive schedule viewing and management
- **Dark Mode**: Full dark/light theme support
- **Responsive Design**: Mobile-friendly interface

### 📄 **PDF Editor Features**
- **Multiple PDF Processing Technologies**:
  - **PDF.js Editor** (Frontend-only, Recommended)
  - **Backend Editor** (Python + PyMuPDF)
  - **Alternative Backend** (Python + pdf2image)
- **Advanced Editing Tools**:
  - Drawing and annotation tools
  - Text insertion and editing
  - Shape tools (rectangles, circles)
  - Highlighter and markup tools
  - Pointer/move functionality
- **Export Capabilities**: Download edited PDFs and game statistics

## 🏗️ Project Structure

```
football.ai/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── contexts/         # React contexts (DarkMode)
│   │   ├── services/         # API services
│   │   └── utils/           # Utility functions
│   ├── public/              # Static assets
│   └── package.json         # Frontend dependencies
├── backend/                 # Python backend services
│   ├── main.py             # Main PyMuPDF backend
│   ├── main_alt.py         # Alternative pdf2image backend
│   ├── requirements.txt    # Python dependencies
│   ├── uploads/            # PDF file storage
│   └── start_backend.bat   # Windows startup script
└── README.md               # This file
```

## 🛠️ Installation & Setup

### **Prerequisites**
- Node.js (v16 or higher)
- Python (v3.8 or higher)
- npm or yarn

### **Frontend Setup**

1. **Navigate to frontend directory**:
   ```bash
   cd frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start development server**:
   ```bash
   npm start
   ```

4. **Access the application**:
   Open [http://localhost:3000](http://localhost:3000) in your browser

### **Quick Start (All Platforms)**

**Windows:**
```bash
# Double-click or run:
start.bat
```

**Linux/macOS:**
```bash
# Make executable and run:
chmod +x start.sh
./start.sh
```

### **Backend Setup (Optional)**

The PDF.js editor works without a backend, but for advanced features, you can run the Python backend:

#### **Option 1: PyMuPDF Backend (Port 8000)**

1. **Navigate to backend directory**:
   ```bash
   cd backend
   ```

2. **Install Python dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Start the server**:
   ```bash
   python main.py
   ```

#### **Option 2: pdf2image Backend (Port 8001)**

1. **Install additional dependencies**:
   ```bash
   pip install -r requirements_alt.txt
   ```

2. **Start the alternative server**:
   ```bash
   python start_alt.py
   ```

#### **Windows Quick Start**:
```bash
# Run the batch file
backend/start_backend.bat
```

## 🎯 Usage

### **Getting Started**

1. **Launch the application** by running the frontend
2. **Navigate through the tabs**:
   - **Dashboard**: Overview and navigation
   - **Teams**: Team management and rosters
   - **Schedule**: Game schedules and calendar
   - **Stats**: Game statistics and analysis
   - **Import**: PDF upload and editing

### **PDF Editor Usage**

#### **PDF.js Editor (Recommended)**
1. Go to the **Import** tab
2. Select **"PDF.js Editor"** option
3. Upload a PDF file
4. Click **"Edit PDF"**
5. Use the toolbar to:
   - Draw with the pen tool
   - Add text annotations
   - Create shapes and highlights
   - Navigate between pages
6. Save or download your edited PDF

#### **Backend Editor**
1. Ensure the Python backend is running
2. Select **"Backend Editor"** option
3. Upload and edit PDFs with server-side processing

## 🔧 Technology Stack

### **Frontend**
- **React 18** - UI framework
- **React Router** - Navigation
- **Tailwind CSS** - Styling
- **PDF.js** - PDF rendering and editing
- **Lucide React** - Icons
- **html2pdf.js** - PDF generation

### **Backend**
- **FastAPI** - Python web framework
- **PyMuPDF (fitz)** - PDF processing
- **pdf2image** - Alternative PDF processing
- **Pillow** - Image processing
- **Uvicorn** - ASGI server

## 📁 Key Components

### **Frontend Components**
- `App.js` - Main application component
- `TeamPageEnhanced.js` - Team management interface
- `SchedulePage.js` - Schedule viewing and management
- `GameStatsPage.js` - Game statistics and analysis
- `ImportPage.js` - PDF upload and editor selection
- `PDFJSEditor.js` - Frontend PDF editor (PDF.js)
- `BackendPDFEditor.js` - Backend PDF editor interface

### **Backend Services**
- `main.py` - PyMuPDF-based PDF processing
- `main_alt.py` - pdf2image-based PDF processing
- `requirements.txt` - Python dependencies

## 🚨 Troubleshooting

### **Common Issues**

#### **PDF Editor Not Working**
- **Solution**: Use the PDF.js editor (frontend-only)
- **Alternative**: Ensure Python backend is running

#### **"Orphaned Object" Error**
- **Cause**: PyMuPDF compatibility issue with certain PDFs
- **Solution**: Use PDF.js editor or pdf2image backend

#### **Backend Connection Refused**
- **Solution**: Start the Python backend server
- **Check**: Ensure port 8000 or 8001 is available

#### **Frontend Build Issues**
- **Solution**: Clear cache and reinstall dependencies
  ```bash
  cd frontend
  rm -rf node_modules package-lock.json
  npm install
  ```

## 🔄 Development

### **Adding New Features**
1. **Frontend**: Add components in `frontend/src/components/`
2. **Backend**: Add endpoints in `backend/main.py` or `backend/main_alt.py`
3. **Styling**: Use Tailwind CSS classes
4. **State Management**: Use React hooks and contexts

### **PDF Editor Customization**
- **Tools**: Add new tools in the toolbar
- **Rendering**: Modify canvas rendering logic
- **Export**: Customize PDF export functionality

## 📝 API Endpoints

### **Backend API (Port 8000/8001)**
- `GET /` - Health check
- `POST /upload-pdf` - Upload PDF file
- `GET /pdf-page/{file_id}/{page_num}` - Get PDF page as image
- `POST /add-annotations` - Save annotations
- `GET /get-annotations/{file_id}` - Retrieve annotations
- `GET /export-pdf/{file_id}` - Export modified PDF

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For issues and questions:
1. Check the troubleshooting section
2. Review the component documentation
3. Create an issue in the repository

---

**Built with ❤️ for sports analytics and PDF editing**