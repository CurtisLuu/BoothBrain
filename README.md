# Football AI - AI-Powered Football Analytics

A comprehensive web application that provides real-time football statistics, game analysis, and AI-powered insights for both NFL and NCAA games.

## 🏈 Features

- **Real-time Game Data**: Live scores, schedules, and game information from ESPN API
- **Advanced Statistics**: Detailed player and team statistics with comprehensive analytics
- **Team vs Team Comparison**: Head-to-head records and statistical comparisons
- **Dark Mode Support**: Beautiful dark/light theme toggle
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Search Functionality**: Quick team search with intelligent suggestions
- **Multi-League Support**: Both NFL and NCAA football coverage

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v16 or higher)
- **Python** (v3.8 or higher)
- **npm** or **yarn**

### Installation & Launch

#### Option 1: Automated Launch (Recommended)

**Windows:**
```bash
start.bat
```

**Linux/Mac:**
```bash
chmod +x start.sh
./start.sh
```

#### Option 2: Manual Launch

**1. Start Backend Server:**
```bash
cd backend
pip install -r requirements.txt
python app.py
```

**2. Start Frontend Server:**
```bash
cd frontend
npm install
npm start
```

**3. Access the Application:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## 📁 Project Structure

```
football.ai/
├── frontend/                 # React frontend application
│   ├── public/              # Static assets
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── contexts/        # React context providers
│   │   ├── services/        # API services
│   │   ├── App.js          # Main app component
│   │   ├── index.js        # Entry point
│   │   └── index.css       # Global styles
│   ├── package.json
│   └── tailwind.config.js
├── backend/                 # Flask backend API
│   ├── app.py              # Main Flask application
│   └── requirements.txt    # Python dependencies
├── start.bat               # Windows launch script
├── start.sh                # Linux/Mac launch script
└── README.md
```

## 🛠️ Technology Stack

### Frontend
- **React 18** - Modern React with hooks
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Beautiful icon library
- **Context API** - State management

### Backend
- **Flask** - Lightweight Python web framework
- **Flask-CORS** - Cross-origin resource sharing
- **Requests** - HTTP library for API calls

### APIs
- **ESPN API** - Real-time sports data
- **ESPN Core API** - Detailed statistics and team information

## 🎯 Key Components

### Frontend Components
- **Dashboard**: Main landing page with game cards
- **GameStatsPage**: Detailed game statistics and analysis
- **SchedulePage**: Game schedules and upcoming matches
- **TeamPage**: Team information and rosters
- **GameCard**: Individual game display component

### Backend Endpoints
- `GET /api/nfl/games` - NFL games data
- `GET /api/ncaa/games` - NCAA games data
- `GET /api/health` - Health check

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the backend directory:
```env
FLASK_ENV=development
FLASK_DEBUG=True
```

### API Configuration
The application uses ESPN's public APIs. No API keys are required for basic functionality.

## 📱 Usage

1. **View Games**: Browse current and upcoming NFL/NCAA games
2. **Game Statistics**: Click "View Stats" on any game card for detailed analysis
3. **Team Search**: Use the search bar to find specific teams
4. **League Toggle**: Switch between NFL and NCAA games
5. **Dark Mode**: Toggle between light and dark themes

## 🚀 Deployment

### Frontend (Netlify/Vercel)
```bash
cd frontend
npm run build
# Deploy the 'build' folder
```

### Backend (Heroku/Railway)
```bash
cd backend
# Deploy with requirements.txt
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the console for error messages
2. Ensure all dependencies are installed
3. Verify that both frontend and backend servers are running
4. Check that the ESPN API is accessible

## 🔮 Future Enhancements

- [ ] Player statistics and performance tracking
- [ ] Advanced analytics and predictions
- [ ] User accounts and favorites
- [ ] Push notifications for game updates
- [ ] Mobile app development
- [ ] Social features and sharing

---

**Built with ❤️ for football fans everywhere**