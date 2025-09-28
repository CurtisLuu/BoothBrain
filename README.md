# 🏈 BoothBrain - Advanced Sports Analytics Platform

A comprehensive AI-powered sports analytics platform featuring real-time game analysis, support for announcer reports, and a personal AI football analyst willing to help at any time.

## 🚀 Features

### 🤖 **AI-Powered Analytics**
- **Intelligent Chat Interface**: Ask questions about games, players, and statistics
- **Professional Analysis**: AI acts as collegiate and NFL analyst
- **Real-time Insights**: Get instant analysis of current season games
- **Radial Menu**: Quick access to game summaries, player analysis, highlights, and stats
- **Web Search Integration**: AI searches for latest game information and statistics

### 📊 **Core Features**
- **Team Management**: Comprehensive team rosters and statistics
- **Game Statistics**: Detailed game analysis and performance metrics with demo data
- **Schedule Management**: Interactive schedule viewing and management
- **Live Game Data**: Real-time NFL and NCAA game information
- **Dark Mode**: Full dark/light theme support
- **Responsive Design**: Mobile-friendly interface

### 💬 **Interactive Chat System**
- **Instant Response**: Zero-delay chat expansion and message processing
- **Message Queue**: Handles multiple concurrent requests seamlessly
- **Professional Prompts**: Pre-configured analysis requests for games
- **Auto-scroll**: Always shows most recent conversation
- **Session Management**: Persistent chat sessions

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
BoothBrain/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/       # React components
│   │   │   ├── CedarChat.js  # AI chat interface
│   │   │   ├── RadialMenu.js # Game analysis menu
│   │   │   ├── GameStatsPage.js # Game statistics
│   │   │   ├── TeamPageEnhanced.js # Team management
│   │   │   └── SchedulePage.js # Schedule management
│   │   ├── contexts/         # React contexts
│   │   │   ├── DarkModeContext.js # Theme management
│   │   │   └── SearchContext.js # Search functionality
│   │   ├── services/         # API services
│   │   │   ├── footballApi.js # Sports data API
│   │   │   ├── chatApi.js    # AI chat API
│   │   │   └── sportsApi.js  # ESPN API integration
│   │   └── utils/           # Utility functions
│   ├── public/              # Static assets
│   └── package.json         # Frontend dependencies
├── backend/                 # Python backend services
│   ├── main.py             # Main FastAPI backend
│   ├── main_alt.py         # Alternative backend
│   ├── requirements.txt    # Python dependencies
│   ├── uploads/            # File storage
│   └── start_backend.bat   # Windows startup script
├── start.bat               # Windows startup script
├── start.sh                # Linux/macOS startup script
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

### **AI Chat Features**

#### **Using the Radial Menu**
1. **Select a game** from the schedule or stats page
2. **Right-click or long-press** on a game card
3. **Choose from analysis options**:
   - **Game Summary**: Comprehensive game analysis
   - **Standout Players**: Top performer analysis
   - **Highlights**: Key plays and moments
   - **Stats**: Detailed statistical breakdown
4. **Chat opens automatically** with professional analysis

#### **Manual Chat Usage**
1. **Click the chat input** at the bottom of the screen
2. **Type your question** about any game, player, or statistic
3. **Get instant AI analysis** with current season data
4. **Ask follow-up questions** for deeper insights

#### **Chat Features**
- **Zero-delay response**: Instant chat expansion
- **Message queue**: Handle multiple requests
- **Auto-scroll**: Always see latest conversation
- **Professional analysis**: AI acts as sports analyst
- **Current season focus**: Only latest data

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
- **Context API** - State management
- **Custom Hooks** - Reusable logic

### **Backend**
- **FastAPI** - Python web framework
- **PyMuPDF (fitz)** - PDF processing
- **pdf2image** - Alternative PDF processing
- **Pillow** - Image processing
- **Uvicorn** - ASGI server
- **Google Gemini AI** - AI chat integration
- **Web Search API** - Real-time data fetching

### **AI & Data**
- **Google Gemini AI** - Natural language processing
- **ESPN API** - Live sports data
- **Web Search Integration** - Current season information
- **Message Queue System** - Concurrent request handling

## 📁 Key Components

### **Frontend Components**
- `App.js` - Main application component with AI chat integration
- `CedarChat.js` - AI chat interface with message queue system
- `RadialMenu.js` - Game analysis radial menu
- `GameStatsPage.js` - Game statistics with demo data generation
- `TeamPageEnhanced.js` - Team management interface
- `SchedulePage.js` - Schedule viewing and management
- `GameCard.js` - Individual game display cards
- `ImportPage.js` - PDF upload and editor selection
- `PDFJSEditor.js` - Frontend PDF editor (PDF.js)
- `BackendPDFEditor.js` - Backend PDF editor interface

### **Context Providers**
- `DarkModeContext.js` - Theme management
- `SearchContext.js` - Global search functionality

### **API Services**
- `footballApi.js` - Sports data API integration
- `chatApi.js` - AI chat API communication
- `sportsApi.js` - ESPN API integration

### **Backend Services**
- `main.py` - FastAPI backend with AI integration
- `main_alt.py` - Alternative backend implementation
- `requirements.txt` - Python dependencies

## 🚨 Troubleshooting

### **Common Issues**

#### **AI Chat Not Responding**
- **Solution**: Check if backend is running (required for AI features)
- **Alternative**: Use demo data mode for statistics
- **Check**: Ensure Google Gemini API is configured

#### **Radial Menu Not Working**
- **Solution**: Right-click or long-press on game cards
- **Check**: Ensure game data is loaded
- **Alternative**: Use manual chat input

#### **Message Queue Issues**
- **Solution**: Clear chat queue using the "Clear Queue" button
- **Check**: Refresh the page if messages get stuck
- **Reset**: Clear browser storage if persistent issues

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

#### **AI Analysis Not Current**
- **Solution**: Ensure prompts specify "current season only"
- **Check**: AI should search for latest data
- **Reset**: Clear chat and try again

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

### **AI Chat API**
- `POST /chat/session` - Create new chat session
- `POST /chat/message` - Send message to AI
- `POST /chat/clear` - Clear chat session
- `GET /chat/session/{session_id}` - Get session details

### **Sports Data API**
- `GET /games/nfl` - Get NFL games
- `GET /games/ncaa` - Get NCAA games
- `GET /games/{game_id}/summary` - Get game summary
- `GET /games/{game_id}/boxscore` - Get game boxscore
- `GET /teams/{team_id}/roster` - Get team roster
- `GET /teams/{team_id}/stats` - Get team statistics

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

**Built with ❤️ for AI-powered sports analytics and PDF editing**

## 🎯 Key Features Summary

- **🤖 AI-Powered Analysis**: Professional sports analysis with Google Gemini AI
- **💬 Interactive Chat**: Zero-delay chat with message queue system
- **🎯 Radial Menu**: Quick game analysis with right-click/long-press
- **📊 Live Data**: Real-time NFL and NCAA game information
- **📄 PDF Editing**: Advanced PDF editing with multiple technologies
- **🌙 Dark Mode**: Full theme support
- **📱 Responsive**: Mobile-friendly design
- **⚡ Fast**: Optimized performance with concurrent request handling
