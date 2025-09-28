import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Trophy, BarChart3, Home, ArrowLeft } from 'lucide-react';
import { useDarkMode } from '../contexts/DarkModeContext';

const GameStatsPage = ({ activeLeague, setActiveLeague }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isDarkMode } = useDarkMode();
  const [selectedGame, setSelectedGame] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (location.state?.game) {
      setSelectedGame(location.state.game);
    }
  }, [location.state]);

  const handleBackToHome = () => {
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading game statistics...</p>
        </div>
      </div>
    );
  }

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
                  <Trophy className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white">Game Statistics</h1>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Detailed game analysis</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {selectedGame ? (
          <div className="space-y-8">
            {/* Game Header */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {selectedGame.awayTeam} vs {selectedGame.homeTeam}
                </h2>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {selectedGame.week} • {selectedGame.date} • {selectedGame.time}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-8">
                <div className="text-center">
                  <div className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                    {selectedGame.awayScore}
                  </div>
                  <div className="text-lg font-medium text-gray-700 dark:text-gray-300">
                    {selectedGame.awayTeam}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                    {selectedGame.homeScore}
                  </div>
                  <div className="text-lg font-medium text-gray-700 dark:text-gray-300">
                    {selectedGame.homeTeam}
                  </div>
                </div>
              </div>
              
              <div className="mt-4 text-center">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  selectedGame.status === 'Final' 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                    : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                }`}>
                  {selectedGame.status}
                </span>
              </div>
            </div>

            {/* Statistics Placeholder */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <BarChart3 className="w-5 h-5 mr-2 text-primary-600" />
                Game Statistics
              </h3>
              <div className="text-center py-12">
                <BarChart3 className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <h4 className="text-xl font-semibold text-gray-600 dark:text-gray-300 mb-2">
                  Statistics Coming Soon
                </h4>
                <p className="text-gray-500 dark:text-gray-400">
                  Detailed game statistics and player performance data will be available here.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <Trophy className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-300 mb-2">
              No Game Selected
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              Please select a game from the home page to view statistics.
            </p>
            <button
              onClick={handleBackToHome}
              className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center space-x-2 mx-auto"
            >
              <Home className="w-5 h-5" />
              <span>Go to Home</span>
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default GameStatsPage;
