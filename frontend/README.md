# 🎨 Frontend - Football AI

React-based frontend application for the Football AI sports analytics platform.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build
```

## 📁 Project Structure

```
frontend/
├── public/
│   ├── index.html          # Main HTML template
│   └── js/
│       └── pdf.worker.min.js  # PDF.js worker
├── src/
│   ├── components/         # React components
│   │   ├── App.js         # Main app component
│   │   ├── TeamPageEnhanced.js    # Team management
│   │   ├── SchedulePage.js        # Schedule viewing
│   │   ├── GameStatsPage.js       # Game statistics
│   │   ├── ImportPage.js          # PDF upload/editing
│   │   ├── PDFJSEditor.js         # PDF.js editor
│   │   └── BackendPDFEditor.js    # Backend editor UI
│   ├── contexts/
│   │   └── DarkModeContext.js     # Dark mode context
│   ├── services/
│   │   ├── footballApi.js         # Football API service
│   │   └── sportsApi.js           # Sports API service
│   ├── utils/
│   │   └── pdfGenerator.js        # PDF generation utilities
│   ├── index.js           # Entry point
│   └── index.css          # Global styles
├── package.json           # Dependencies
└── tailwind.config.js     # Tailwind configuration
```

## 🎯 Key Features

### **PDF Editor Technologies**
- **PDF.js Editor**: Frontend-only, most reliable
- **Backend Editor**: Python backend integration
- **Multiple Tools**: Drawing, text, shapes, highlighting

### **Sports Analytics**
- **Team Management**: Rosters and statistics
- **Game Statistics**: Performance analysis
- **Schedule Management**: Calendar and events
- **Dark Mode**: Theme switching

## 🛠️ Development

### **Available Scripts**
- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run tests
- `npm run eject` - Eject from Create React App

### **Dependencies**
- **React 18** - UI framework
- **React Router** - Navigation
- **Tailwind CSS** - Styling
- **PDF.js** - PDF processing
- **Lucide React** - Icons
- **html2pdf.js** - PDF generation

### **Environment Variables**
Create `.env` file for configuration:
```env
REACT_APP_API_URL=http://localhost:8000
REACT_APP_ALT_API_URL=http://localhost:8001
```

## 🎨 Styling

The project uses **Tailwind CSS** for styling. Key classes:
- `bg-white dark:bg-gray-900` - Theme-aware backgrounds
- `text-gray-900 dark:text-white` - Theme-aware text
- `hover:bg-blue-600` - Interactive states
- `rounded-lg` - Border radius
- `shadow-lg` - Drop shadows

## 🔧 Component Architecture

### **Main Components**
- **App.js**: Main application with routing
- **TeamPageEnhanced.js**: Team management interface
- **SchedulePage.js**: Schedule viewing and management
- **GameStatsPage.js**: Game statistics and analysis
- **ImportPage.js**: PDF upload and editor selection

### **PDF Editor Components**
- **PDFJSEditor.js**: Frontend PDF editor using PDF.js
- **BackendPDFEditor.js**: Backend PDF editor interface

### **Context Providers**
- **DarkModeContext.js**: Global dark mode state management

## 🚨 Troubleshooting

### **Common Issues**
1. **PDF Editor not loading**: Check if PDF.js is loaded correctly
2. **Backend connection failed**: Ensure Python backend is running
3. **Build errors**: Clear node_modules and reinstall dependencies

### **Debug Mode**
Enable debug logging by setting:
```javascript
localStorage.setItem('debug', 'true');
```

## 📱 Responsive Design

The application is fully responsive with breakpoints:
- **Mobile**: < 640px
- **Tablet**: 640px - 1024px
- **Desktop**: > 1024px

## 🎯 Performance

### **Optimization Tips**
- Use React.memo for expensive components
- Lazy load PDF editor components
- Optimize images and assets
- Use production build for deployment

### **Bundle Analysis**
```bash
npm run build
npx serve -s build
```

## 🔄 State Management

The application uses:
- **React Hooks** for local state
- **Context API** for global state (dark mode)
- **Local Storage** for persistence

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm test -- --coverage

# Run specific test
npm test -- --testNamePattern="ComponentName"
```

## 📦 Build & Deployment

### **Production Build**
```bash
npm run build
```

### **Deployment Options**
- **Netlify**: Drag and drop build folder
- **Vercel**: Connect GitHub repository
- **AWS S3**: Upload build folder
- **Docker**: Use provided Dockerfile

## 🔗 API Integration

### **Backend Communication**
- **Primary**: `http://localhost:8000` (PyMuPDF backend)
- **Alternative**: `http://localhost:8001` (pdf2image backend)

### **Error Handling**
- Network errors are caught and displayed
- Fallback to PDF.js editor if backend fails
- User-friendly error messages

---

**Frontend built with React and modern web technologies** 🚀
