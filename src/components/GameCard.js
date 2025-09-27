import React from 'react';
import { Clock, TrendingUp } from 'lucide-react';

const GameCard = ({ game, league }) => {
  const getLeagueBg = (league) => {
    return league === 'nfl' ? 'bg-football-nfl' : 'bg-football-ncaa';
  };

  return (
    <div className="game-card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${getLeagueBg(league)}`}></div>
          <span className="text-sm font-medium text-gray-500">{game.week}</span>
        </div>
        <div className="flex items-center space-x-1 text-sm text-gray-500">
          <Clock className="w-4 h-4" />
          <span>{game.time}</span>
        </div>
      </div>

      <div className="space-y-4">
        {/* Teams */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                <span className="text-xs font-bold text-gray-600">
                  {game.awayTeam.split(' ').pop().charAt(0)}
                </span>
              </div>
              <span className="font-medium text-gray-900">{game.awayTeam}</span>
            </div>
            <span className="text-2xl font-bold text-gray-900">{game.awayScore}</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                <span className="text-xs font-bold text-gray-600">
                  {game.homeTeam.split(' ').pop().charAt(0)}
                </span>
              </div>
              <span className="font-medium text-gray-900">{game.homeTeam}</span>
            </div>
            <span className="text-2xl font-bold text-gray-900">{game.homeScore}</span>
          </div>
        </div>

        {/* Status */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center space-x-2">
            <div className={`px-2 py-1 rounded-full text-xs font-medium ${
              game.status === 'Final' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              {game.status}
            </div>
          </div>
          
          <button className="flex items-center space-x-1 text-sm text-primary-600 hover:text-primary-700 transition-colors">
            <TrendingUp className="w-4 h-4" />
            <span>View Stats</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameCard;
