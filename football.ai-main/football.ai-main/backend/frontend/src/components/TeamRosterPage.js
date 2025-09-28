import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import footballApi from '../services/footballApi';

const TeamRosterPage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [teamInfo, setTeamInfo] = useState(null);
  const [roster, setRoster] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setError('Please enter a team name');
      return;
    }

    setLoading(true);
    setError(null);
    setTeamInfo(null);
    setRoster([]);

    try {
      console.log(`🔍 Searching for team: ${searchTerm}`);
      
      // First, find the team
      const team = await footballApi.getTeamByName(searchTerm);
      console.log('Team search result:', team);
      
      if (!team) {
        setError(`Team "${searchTerm}" not found`);
        setLoading(false);
        return;
      }

      setTeamInfo(team);
      console.log(`✅ Found team: ${team.name} (ID: ${team.id})`);

      // Then get the roster
      console.log(`🔍 Getting roster for team ID: ${team.id}`);
      const teamRoster = await footballApi.getTeamRoster(team.id);
      console.log('Roster result:', teamRoster);
      
      setRoster(teamRoster);
      console.log(`✅ Loaded ${teamRoster.length} players`);

    } catch (error) {
      console.error('Error searching team:', error);
      setError(`Error searching for team: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const groupPlayersByPosition = (players) => {
    const grouped = {};
    players.forEach(player => {
      const position = player.position || 'Other';
      if (!grouped[position]) {
        grouped[position] = [];
      }
      grouped[position].push(player);
    });
    return grouped;
  };

  const positionOrder = ['QB', 'RB', 'WR', 'TE', 'OL', 'DL', 'LB', 'CB', 'S', 'K', 'P', 'Other'];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/')}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 mr-4"
              >
                ← Back to Dashboard
              </button>
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                Team Roster Search
              </h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Search for NFL Team Roster
          </h2>
          
          <div className="flex gap-4 mb-4">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter team name (e.g., Seattle Seahawks, Kansas City Chiefs)"
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
            <button
              onClick={handleSearch}
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
              <p className="text-red-800 dark:text-red-200">{error}</p>
            </div>
          )}

          {/* Test Buttons */}
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setSearchTerm('Seattle Seahawks')}
              className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
            >
              Seattle Seahawks
            </button>
            <button
              onClick={() => setSearchTerm('Kansas City Chiefs')}
              className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
            >
              Kansas City Chiefs
            </button>
            <button
              onClick={() => setSearchTerm('Arizona Cardinals')}
              className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
            >
              Arizona Cardinals
            </button>
            <button
              onClick={() => setSearchTerm('Philadelphia Eagles')}
              className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
            >
              Philadelphia Eagles
            </button>
          </div>
        </div>

        {/* Team Info */}
        {teamInfo && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Team Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Name</label>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">{teamInfo.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Abbreviation</label>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">{teamInfo.abbreviation}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">City</label>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">{teamInfo.city}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Team ID</label>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">{teamInfo.id}</p>
              </div>
            </div>
          </div>
        )}

        {/* Roster */}
        {roster.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Team Roster ({roster.length} players)
            </h2>
            
            {(() => {
              const groupedPlayers = groupPlayersByPosition(roster);
              return positionOrder.map(position => {
                const players = groupedPlayers[position];
                if (!players || players.length === 0) return null;
                
                return (
                  <div key={position} className="mb-6">
                    <h3 className="text-md font-semibold text-gray-800 dark:text-gray-200 mb-3 border-b border-gray-200 dark:border-gray-700 pb-2">
                      {position} ({players.length})
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {players.map((player, index) => (
                        <div
                          key={index}
                          className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 border border-gray-200 dark:border-gray-600"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">
                                #{player.jersey} {player.name}
                              </p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {player.position} • {player.height} • {player.weight} lbs
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              });
            })()}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600 dark:text-gray-400">Loading team roster...</span>
            </div>
          </div>
        )}

        {/* Debug Section */}
        <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 mt-8">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Debug Information</h3>
          <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
            <div>Search Term: "{searchTerm}"</div>
            <div>Team Found: {teamInfo ? '✅' : '❌'}</div>
            <div>Team ID: {teamInfo?.id || 'N/A'}</div>
            <div>Players Loaded: {roster.length}</div>
            <div>Loading: {loading ? '✅' : '❌'}</div>
            <div>Error: {error || 'None'}</div>
          </div>
          <button
            onClick={() => {
              console.log('=== DEBUG INFO ===');
              console.log('Search Term:', searchTerm);
              console.log('Team Info:', teamInfo);
              console.log('Roster:', roster);
              console.log('Loading:', loading);
              console.log('Error:', error);
            }}
            className="mt-2 px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Log Debug Info to Console
          </button>
        </div>
      </div>
    </div>
  );
};

export default TeamRosterPage;
