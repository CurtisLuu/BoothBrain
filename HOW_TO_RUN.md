# 🚀 How to Run BoothBrain

## ⚡ Quick Start

### **Option 1: Use Startup Scripts (Recommended)**

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

### **Option 2: Manual Start**

**1. Start Frontend:**
```bash
cd frontend
npm install  # Only needed first time
npm start
```

**2. Start Backend (Optional):**
```bash
cd backend
pip install -r requirements.txt  # Only needed first time
python main.py
```

## 🌐 Access the Application

- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:8000 (if running)

## 🔧 Troubleshooting

### **"npm start" not working from root directory**
- **Problem**: You're in the wrong directory
- **Solution**: Run `cd frontend` first, then `npm start`

### **"package.json not found" error**
- **Problem**: You're in the root directory instead of frontend
- **Solution**: Navigate to the frontend folder first

### **Backend connection errors**
- **Problem**: Backend not running
- **Solution**: Use PDF.js editor (frontend-only) or start the Python backend

## 📁 Project Structure

```
BoothBrain/
├── frontend/          # React app (run npm start here)
├── backend/           # Python API (run python main.py here)
├── start.bat          # Windows startup script
├── start.sh           # Linux/macOS startup script
└── README.md          # Full documentation
```

## 🎯 What to Expect

1. **Frontend starts** → Opens browser to http://localhost:3000
2. **Backend starts** → API available at http://localhost:8000
3. **PDF Editor works** → Upload PDFs and edit them
4. **Sports Analytics** → View teams, schedules, and stats

---

**Need help?** Check the main README.md for detailed documentation.
