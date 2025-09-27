# Football AI - NFL & NCAA Analytics

A modern web application that provides AI-powered football analytics and insights for both NFL and NCAA games. Built with React and Cedar-OS for intelligent chat interactions.

## Features

- 🏈 **Dual League Support**: Toggle between NFL and NCAA games
- 🤖 **AI Chat Assistant**: Powered by Cedar-OS for intelligent conversations about games, stats, and players
- 📊 **Real-time Analytics**: Live game statistics and performance metrics
- 🎨 **Modern UI**: Clean, responsive design with Tailwind CSS
- 💬 **Interactive Chat**: Floating chat widget for instant AI assistance

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd football.ai
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

## Tech Stack

- **React 18**: Modern React with hooks
- **Cedar-OS**: AI chat integration framework
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Beautiful icon library
- **Vite**: Fast build tool and dev server

## Project Structure

```
src/
├── components/
│   ├── ChatWidget.js      # AI chat interface
│   └── GameCard.js        # Game display component
├── App.js                 # Main application component
├── index.js              # Application entry point
└── index.css             # Global styles and Tailwind imports
```

## Features Overview

### Landing Page
- Clean, modern design with gradient backgrounds
- Tab navigation between NFL and NCAA games
- Hero section with feature highlights
- Responsive grid layout for game cards

### Game Cards
- Real-time game scores and status
- Team information with visual indicators
- Quick access to detailed statistics
- League-specific color coding

### AI Chat Widget
- Floating chat interface
- Real-time message streaming
- Context-aware responses about football
- Easy toggle for show/hide

## Customization

The application is built with modularity in mind. You can easily:

- Add new game data sources
- Customize the AI chat responses
- Modify the color scheme in `tailwind.config.js`
- Add new features to the chat widget

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License.