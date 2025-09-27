# Football AI - NFL & NCAA Analytics

A modern web application that provides AI-powered football analytics and insights for both NFL and NCAA games. Built with React and Cedar-OS for intelligent chat interactions.

## Features

- 🏈 **Dual League Support**: Toggle between NFL and NCAA games
- 📊 **Live Game Data**: Real-time scores and game information via RapidAPI
- 🔄 **Auto-Refresh**: Games update automatically every 5 minutes
- ⚡ **Real-time Updates**: Live scores, game status, and team information
- 🎨 **Modern UI**: Clean, responsive design with Tailwind CSS
- 📱 **Responsive Design**: Works perfectly on all device sizes

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- RapidAPI account and API key

### API Setup

1. Sign up for a free account at [RapidAPI](https://rapidapi.com/)
2. Subscribe to the [Free API Live Football Data](https://rapidapi.com/Creativesdev/api/free-api-live-football-data)
3. Get your API key from the RapidAPI dashboard
4. Create a `.env` file in the root directory:
```bash
REACT_APP_RAPIDAPI_KEY=your-rapidapi-key-here
```

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

3. Set up your API key (see API Setup above)

4. Start the development server:
```bash
npm start
```

5. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

## Tech Stack

- **React 18**: Modern React with hooks
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Beautiful icon library
- **React Scripts**: Build tool and dev server

## Cedar-OS Integration

This project is designed to integrate with Cedar-OS for AI chat functionality. Currently, it includes a mock chat system that simulates AI responses. When Cedar-OS packages become available, you can:

1. Install Cedar-OS packages:
   ```bash
   npm install @cedar-ai/react @cedar-ai/core
   ```

2. Replace the mock ChatWidget with Cedar-OS components
3. Connect to your preferred AI backend (OpenAI, Anthropic, etc.)

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