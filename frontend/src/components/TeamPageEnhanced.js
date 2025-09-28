import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, ArrowLeft, Search, Star } from 'lucide-react';

const TeamPageEnhanced = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleBackToHome = () => {
    navigate('/');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    // Search functionality would be implemented here
    console.log('Searching for team:', searchQuery);
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
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white">Team Information</h1>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Team details and statistics</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Search Teams</h2>
          <form onSubmit={handleSearch} className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search for a team..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Search
            </button>
          </form>
        </div>

        {/* Teams Grid Placeholder */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Teams</h3>
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h4 className="text-xl font-semibold text-gray-600 dark:text-gray-300 mb-2">
              Team Information Coming Soon
            </h4>
            <p className="text-gray-500 dark:text-gray-400">
              Detailed team information, rosters, and statistics will be available here.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TeamPageEnhanced;
