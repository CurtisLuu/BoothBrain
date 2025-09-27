import React, { useState } from 'react';
import { Football, Trophy, BarChart3, MessageCircle, Star } from 'lucide-react';
import ChatWidget from './components/ChatWidget';
import GameCard from './components/GameCard';

function App() {
  const [activeTab, setActiveTab] = useState('nfl');

  const nflGames = [
    {
      id: 1,
      homeTeam: 'Kansas City Chiefs',
      awayTeam: 'Buffalo Bills',
      homeScore: 24,
      awayScore: 17,
      status: 'Final',
      time: '4:25 PM ET',
      week: 'Week 6'
    },
    {
      id: 2,
      homeTeam: 'Philadelphia Eagles',
      awayTeam: 'Dallas Cowboys',
      homeScore: 28,
      awayScore: 23,
      status: 'Final',
      time: '8:20 PM ET',
      week: 'Week 6'
    },
    {
      id: 3,
      homeTeam: 'Miami Dolphins',
      awayTeam: 'New York Jets',
      homeScore: 31,
      awayScore: 21,
      status: 'Final',
      time: '1:00 PM ET',
      week: 'Week 6'
    }
  ];

  const ncaaGames = [
    {
      id: 1,
      homeTeam: 'Georgia Bulldogs',
      awayTeam: 'Alabama Crimson Tide',
      homeScore: 27,
      awayScore: 24,
      status: 'Final',
      time: '3:30 PM ET',
      week: 'Week 7'
    },
    {
      id: 2,
      homeTeam: 'Ohio State Buckeyes',
      awayTeam: 'Michigan Wolverines',
      homeScore: 30,
      awayScore: 27,
      status: 'Final',
      time: '12:00 PM ET',
      week: 'Week 7'
    },
    {
      id: 3,
      homeTeam: 'USC Trojans',
      awayTeam: 'UCLA Bruins',
      homeScore: 35,
      awayScore: 28,
      status: 'Final',
      time: '7:30 PM ET',
      week: 'Week 7'
    }
  ];

  const currentGames = activeTab === 'nfl' ? nflGames : ncaaGames;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-10 h-10 bg-primary-600 rounded-lg">
                <Football className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Football AI</h1>
                <p className="text-sm text-gray-500">Powered by AI Analytics</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setActiveTab('nfl')}
                  className={`tab-button ${activeTab === 'nfl' ? 'active' : 'inactive'}`}
                >
                  NFL
                </button>
                <button
                  onClick={() => setActiveTab('ncaa')}
                  className={`tab-button ${activeTab === 'ncaa' ? 'active' : 'inactive'}`}
                >
                  NCAA
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-r from-primary-600 to-primary-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            AI-Powered Football Analytics
          </h2>
          <p className="text-xl text-primary-100 mb-8 max-w-3xl mx-auto">
            Get instant insights, stats, and fun facts about your favorite {activeTab.toUpperCase()} games. 
            Chat with our AI to discover the stories behind the plays.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
              <BarChart3 className="w-5 h-5 text-white" />
              <span className="text-white font-medium">Live Stats</span>
            </div>
            <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
              <MessageCircle className="w-5 h-5 text-white" />
              <span className="text-white font-medium">AI Chat</span>
            </div>
            <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
              <Star className="w-5 h-5 text-white" />
              <span className="text-white font-medium">Fun Facts</span>
            </div>
          </div>
        </div>
      </section>

      {/* Games Section */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-bold text-gray-900">
              {activeTab === 'nfl' ? 'NFL Games' : 'NCAA Games'}
            </h3>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Trophy className="w-4 h-4" />
              <span>Live Updates</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentGames.map((game) => (
              <GameCard key={game.id} game={game} league={activeTab} />
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose Football AI?
            </h3>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Experience football like never before with our AI-powered platform
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="w-8 h-8 text-primary-600" />
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-2">Real-time Analytics</h4>
              <p className="text-gray-600">
                Get instant access to advanced statistics, player performance metrics, and game insights.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="w-8 h-8 text-primary-600" />
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-2">AI Chat Assistant</h4>
              <p className="text-gray-600">
                Ask questions about games, players, and strategies. Get personalized insights and fun facts.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trophy className="w-8 h-8 text-primary-600" />
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-2">Comprehensive Coverage</h4>
              <p className="text-gray-600">
                Follow both NFL and NCAA games with detailed analysis and historical context.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Chat Widget */}
      <ChatWidget />
    </div>
  );
}

export default App;
