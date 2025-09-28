import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, TrendingUp } from 'lucide-react';
import RadialMenu from './RadialMenu';

const GameCard = ({ game, league }) => {
  const navigate = useNavigate();
  const [radialMenu, setRadialMenu] = useState({ isOpen: false, position: { x: 0, y: 0 } });
  
  const getLeagueBg = (league) => {
    return league === 'nfl' ? 'bg-football-nfl' : 'bg-football-ncaa';
  };

  const formatGameDate = (dateString) => {
    if (!dateString || dateString === 'TBD') return 'TBD';
    
    try {
      const date = new Date(dateString);
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      // Check if it's today, tomorrow, or yesterday
      if (date.toDateString() === today.toDateString()) {
        return 'Today';
      } else if (date.toDateString() === tomorrow.toDateString()) {
        return 'Tomorrow';
      } else if (date.toDateString() === yesterday.toDateString()) {
        return 'Yesterday';
      } else {
        // Format as "Mon, Oct 15" for game cards
        return date.toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric'
        });
      }
    } catch (error) {
      return dateString; // Return original if parsing fails
    }
  };

  const handleViewStats = () => {
    navigate('/stats', { state: { game: { ...game, league } } });
  };

  const handleRightClick = (e) => {
    e.preventDefault();
    setRadialMenu({
      isOpen: true,
      position: { x: e.clientX, y: e.clientY }
    });
  };

  const handleRadialMenuClose = () => {
    setRadialMenu({ isOpen: false, position: { x: 0, y: 0 } });
  };

  const handleRadialMenuSelect = (option) => {
    console.log('Selected option:', option, 'for game:', game);
    // Handle different radial menu options
    switch (option) {
      case 'summary':
        // Navigate to game summary
        navigate('/stats', { state: { game: { ...game, league } } });
        break;
      case 'players':
        // Navigate to players page
        navigate('/stats', { state: { game: { ...game, league }, tab: 'players' } });
        break;
      case 'highlights':
        // Navigate to highlights
        navigate('/stats', { state: { game: { ...game, league }, tab: 'highlights' } });
        break;
      case 'stats':
        // Navigate to stats
        navigate('/stats', { state: { game: { ...game, league }, tab: 'stats' } });
        break;
      default:
        break;
    }
    handleRadialMenuClose();
  };

  return (
    <div className="game-card" onContextMenu={handleRightClick}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${getLeagueBg(league)}`}></div>
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
            {game.week && game.week.toString().includes('Week') ? game.week : `Week ${game.week || 1}`}
          </span>
        </div>
        <div className="flex items-center space-x-1 text-sm text-gray-500 dark:text-gray-400">
          <Clock className="w-4 h-4" />
          <span>{game.time}</span>
          <span className="text-gray-400 dark:text-gray-500">•</span>
          <span>{formatGameDate(game.date)}</span>
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

      {/* Radial Menu */}
      <RadialMenu
        isOpen={radialMenu.isOpen}
        position={radialMenu.position}
        onClose={handleRadialMenuClose}
        onOptionSelect={handleRadialMenuSelect}
        game={game}
      />
    </div>
  );
};

export default GameCard;
