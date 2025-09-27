import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, TrendingUp } from 'lucide-react';

const GameCard = ({ game, league }) => {
  const navigate = useNavigate();
  
  const getLeagueBg = (league) => {
    return league === 'nfl' ? 'bg-football-nfl' : 'bg-football-ncaa';
  };

  const handleViewStats = () => {
    navigate('/stats', { state: { game: { ...game, league } } });
  };

  return (
    <div className="game-card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${getLeagueBg(league)}`}></div>
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{game.week}</span>
        </div>
        <div className="flex items-center space-x-1 text-sm text-gray-500 dark:text-gray-400">
          <Clock className="w-4 h-4" />
          <span>{game.time}</span>
          <span className="text-gray-400 dark:text-gray-500">•</span>
          <span>{game.date}</span>
        </div>
      </div>

      <div className="space-y-4">
        {/* Teams */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center">
                <span className="text-xs font-bold text-gray-600 dark:text-gray-300">
                  {game.awayTeam.split(' ').pop().charAt(0)}
                </span>
              </div>
              <span className="font-medium text-gray-900 dark:text-white">{game.awayTeam}</span>
            </div>
            <span className="text-2xl font-bold text-gray-900 dark:text-white">{game.awayScore}</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center">
                <span className="text-xs font-bold text-gray-600 dark:text-gray-300">
                  {game.homeTeam.split(' ').pop().charAt(0)}
                </span>
              </div>
              <span className="font-medium text-gray-900 dark:text-white">{game.homeTeam}</span>
            </div>
            <span className="text-2xl font-bold text-gray-900 dark:text-white">{game.homeScore}</span>
          </div>
        </div>

        {/* Status */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            <div className={`px-2 py-1 rounded-full text-xs font-medium ${
              game.status === 'Final' 
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
            }`}>
              {game.status}
            </div>
          </div>
          
          <button 
            onClick={handleViewStats}
            className="flex items-center space-x-1 text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 transition-colors"
          >
            <TrendingUp className="w-4 h-4" />
            <span>View Stats</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameCard;
