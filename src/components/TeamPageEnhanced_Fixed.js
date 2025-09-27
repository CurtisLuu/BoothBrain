import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, BarChart3, Calendar, Trophy, Search, Home, Award, Users } from 'lucide-react';
import { useDarkMode } from '../contexts/DarkModeContext';
import footballApi from '../services/footballApi';

const TeamPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  
  const [team, setTeam] = useState(location.state?.team || null);
  const [teamStats, setTeamStats] = useState(null);
  const [teamData, setTeamData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rosterStats, setRosterStats] = useState(null);
  const [rosterLoading, setRosterLoading] = useState(false);

  // Early return if no team
  if (!team) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Trophy className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-300 mb-2">
            No Team Selected
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Please select a team to view their statistics
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Navigation Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/stats')}
                className="flex items-center space-x-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Game Stats</span>
              </button>
              <div className="h-6 w-px bg-gray-300 dark:bg-gray-600"></div>
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-10 h-10 bg-primary-600 rounded-lg">
                  <Trophy className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-black dark:text-white">{team?.name} Team Page</h1>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {team?.league?.toUpperCase()} • Complete season statistics and match history
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={toggleDarkMode}
                className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                {isDarkMode ? '☀️' : '🌙'}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Team Statistics Overview */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
              <BarChart3 className="w-6 h-6 mr-3 text-primary-600" />
              Season Statistics
            </h2>
            <p className="text-gray-600 dark:text-gray-400">Team statistics will be loaded here.</p>
          </div>

          {/* Match History */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
              <Calendar className="w-6 h-6 mr-3 text-primary-600" />
              Match History
            </h2>
            <p className="text-gray-600 dark:text-gray-400">Match history will be loaded here.</p>
          </div>

          {/* Team Roster */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
              <Trophy className="w-6 h-6 mr-3 text-primary-600" />
              Team Roster
            </h2>
            <p className="text-gray-600 dark:text-gray-400">Team roster will be loaded here.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamPage;
