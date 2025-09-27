import React, { useState, useEffect } from 'react';
import { Trophy, BarChart3, Star, RefreshCw } from 'lucide-react';
import GameCard from './components/GameCard';
import footballApi from './services/footballApi';

function App() {
  const [activeTab, setActiveTab] = useState('nfl');
  const [nflGames, setNflGames] = useState([]);
  const [ncaaGames, setNcaaGames] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Load games when component mounts or tab changes
  useEffect(() => {
    loadGames();
  }, [activeTab]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      loadGames();
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [activeTab]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadGames = async () => {
    setLoading(true);
    try {
      console.log('Loading games for:', activeTab);
      if (activeTab === 'nfl') {
        const games = await footballApi.getNFLGames();
        console.log('NFL games loaded:', games);
        setNflGames(games);
      } else {
        const games = await footballApi.getNCAAGames();
        console.log('NCAA games loaded:', games);
        setNcaaGames(games);
      }
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error loading games:', error);
    } finally {
      setLoading(false);
    }
  };

  const currentGames = activeTab === 'nfl' ? nflGames : ncaaGames;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-10 h-10 bg-primary-600 rounded-lg">
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-black">Football AI</h1>
                <p className="text-sm text-gray-700">Powered by AI Analytics</p>
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
      <section 
        className="hero-section"
        style={{
          background: 'linear-gradient(to right, #0ea5e9, #0369a1)',
          minHeight: '400px',
          paddingTop: '4rem',
          paddingBottom: '4rem'
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 drop-shadow-lg">
            AI-Powered Football Analytics
          </h2>
          <p className="text-xl text-white mb-8 max-w-3xl mx-auto opacity-90">
            Get instant insights, stats, and fun facts about your favorite {activeTab.toUpperCase()} games. 
            Discover the stories behind the plays with our advanced analytics.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
              <BarChart3 className="w-5 h-5 text-white" />
              <span className="text-white font-medium">Live Stats</span>
            </div>
            <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
              <Trophy className="w-5 h-5 text-white" />
              <span className="text-white font-medium">Game Analysis</span>
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
            <h3 className="text-2xl font-bold text-black">
              {activeTab === 'nfl' ? 'NFL Games' : 'NCAA Games'} ({currentGames.length})
            </h3>
            <div className="flex items-center space-x-4">
              {lastUpdated && (
                <div className="text-sm text-gray-500">
                  Last updated: {lastUpdated.toLocaleTimeString()}
                </div>
              )}
              <button
                onClick={loadGames}
                disabled={loading}
                className="flex items-center space-x-2 px-3 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                <span>{loading ? 'Loading...' : 'Refresh'}</span>
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center space-x-3">
                <RefreshCw className="w-6 h-6 animate-spin text-primary-600" />
                <span className="text-lg text-gray-600">Loading games...</span>
              </div>
            </div>
          ) : currentGames.length === 0 ? (
            <div className="text-center py-12">
              <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h4 className="text-xl font-semibold text-gray-600 mb-2">No Games Available</h4>
              <p className="text-gray-500 mb-4">
                No {activeTab.toUpperCase()} games found for today. Try refreshing or check back later.
              </p>
              <button
                onClick={loadGames}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                Refresh Games
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentGames.map((game) => (
                <GameCard key={game.id} game={game} league={activeTab} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-black mb-4">
              Why Choose Football AI?
            </h3>
            <p className="text-lg text-gray-700 max-w-2xl mx-auto">
              Experience football like never before with our AI-powered platform
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="w-8 h-8 text-primary-600" />
              </div>
              <h4 className="text-xl font-semibold text-black mb-2">Real-time Analytics</h4>
              <p className="text-gray-700">
                Get instant access to advanced statistics, player performance metrics, and game insights.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-primary-600" />
              </div>
              <h4 className="text-xl font-semibold text-black mb-2">Advanced Analytics</h4>
              <p className="text-gray-700">
                Deep dive into player performance, team statistics, and historical data with our comprehensive analytics.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trophy className="w-8 h-8 text-primary-600" />
              </div>
              <h4 className="text-xl font-semibold text-black mb-2">Comprehensive Coverage</h4>
              <p className="text-gray-700">
                Follow both NFL and NCAA games with detailed analysis and historical context.
              </p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}

export default App;
