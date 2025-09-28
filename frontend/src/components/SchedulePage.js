import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, ArrowLeft, RefreshCw } from 'lucide-react';
import GameCard from './GameCard';
import footballApi from '../services/footballApi';

const SchedulePage = ({ activeLeague, setActiveLeague }) => {
  const navigate = useNavigate();
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    loadGames();
  }, [activeLeague]);

  const loadGames = async () => {
    setLoading(true);
    try {
      console.log('Loading games for:', activeLeague);
      const gameData = activeLeague === 'nfl' 
        ? await footballApi.getNFLGames()
        : await footballApi.getNCAAGames();
      
      console.log(`${activeLeague.toUpperCase()} games loaded:`, gameData);
      setGames(gameData);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error loading games:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleBackToHome}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Home</span>
              </button>
              <div className="h-6 w-px bg-gray-300 dark:bg-gray-600"></div>
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-10 h-10 bg-primary-600 rounded-lg">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white">Game Schedule</h1>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{activeLeague.toUpperCase()} Games</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* League Toggle */}
              <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                <button
                  onClick={() => setActiveLeague('nfl')}
                  className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                    activeLeague === 'nfl' 
                      ? 'bg-primary-600 text-white' 
                      : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white'
                  }`}
                >
                  NFL
                </button>
                <button
                  onClick={() => setActiveLeague('ncaa')}
                  className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                    activeLeague === 'ncaa' 
                      ? 'bg-primary-600 text-white' 
                      : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white'
                  }`}
                >
                  NCAA
                </button>
              </div>
              
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
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center space-x-3">
              <RefreshCw className="w-6 h-6 animate-spin text-primary-600" />
              <span className="text-lg text-gray-600 dark:text-gray-300">Loading games...</span>
            </div>
          </div>
        ) : games.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h4 className="text-xl font-semibold text-gray-600 dark:text-gray-300 mb-2">No Games Available</h4>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              No {activeLeague.toUpperCase()} games found. Try refreshing or check back later.
            </p>
            <button
              onClick={loadGames}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Refresh Games
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {activeLeague.toUpperCase()} Game Schedule
              </h2>
              {lastUpdated && (
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Last updated: {lastUpdated.toLocaleTimeString()}
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {games.map((game) => (
                <GameCard key={game.id} game={game} league={activeLeague} />
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default SchedulePage;
