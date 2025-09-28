import React, { useState, useEffect, useCallback } from 'react';
import { Trophy, BarChart3, Home, Search, Moon, Sun, Calendar, MapPin, Filter, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import footballApi from '../services/footballApi';
import { useDarkMode } from '../contexts/DarkModeContext';
import { useSearch } from '../contexts/SearchContext';

const SchedulePage = ({ activeLeague, setActiveLeague }) => {
  const navigate = useNavigate();
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const { 
    searchQuery, 
    setSearchQuery, 
    searchSuggestions, 
    showSuggestions, 
    setShowSuggestions,
    handleSearchInputChange,
    handleSuggestionClick,
    handleSearch
  } = useSearch();
  const [activePage, setActivePage] = useState('schedule');
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [availableTeams, setAvailableTeams] = useState([]);

  // Helper function to extract week number from week string
  const extractWeekNumber = (weekString) => {
    if (!weekString) return 0;
    const match = weekString.toString().match(/Week (\d+)/);
    return match ? parseInt(match[1]) : 0;
  };

  // Helper function to format date for display (user-friendly format)
  const formatDateForDisplay = (dateString) => {
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
        // Format as "Day, Month Date" (e.g., "Monday, Oct 15")
        return date.toLocaleDateString('en-US', {
          weekday: 'long',
          month: 'short',
          day: 'numeric'
        });
      }
    } catch (error) {
      return dateString; // Return original if parsing fails
    }
  };

  // Load games function - Enhanced with systematic week-by-week fetching
  const loadGames = useCallback(async () => {
    setLoading(true);
    try {
      console.log(`=== LOADING SCHEDULE GAMES ===`);
      console.log(`League: ${activeLeague}, Selected Team: ${selectedTeam}`);
      
      let allGames = [];
      
      if (selectedTeam === 'all') {
        // For "all teams" view, use systematic week-by-week fetching
        console.log('Fetching all games using systematic week-by-week approach...');
        
        // Get current week to know how many weeks to fetch
        const currentWeek = await footballApi.getCurrentWeek(activeLeague);
        console.log(`Current week: ${currentWeek}`);
        
        // Fetch all weeks from 1 to current week + 4 (to get future games)
        const maxWeek = Math.min(currentWeek + 4, activeLeague === 'nfl' ? 18 : 12);
        console.log(`Fetching weeks 1 through ${maxWeek}...`);
        
        for (let week = 1; week <= maxWeek; week++) {
          console.log(`Fetching week ${week} games...`);
          try {
            const weekGames = activeLeague === 'nfl' 
              ? await footballApi.getNFLGamesByWeek(week) 
              : await footballApi.getNCAAGamesByWeek(week);
            
            console.log(`Week ${week} games: ${weekGames.length}`);
            
            // Add week information to each game
            const weekGamesWithInfo = weekGames.map(game => ({
              ...game,
              weekType: week < currentWeek ? 'previous' : week === currentWeek ? 'current' : 'next',
              week: `Week ${week}`,
              weekNumber: week
            }));
            
            allGames = [...allGames, ...weekGamesWithInfo];
            
            // Add a small delay to avoid rate limiting
            if (week < maxWeek) {
              await new Promise(resolve => setTimeout(resolve, 100));
            }
          } catch (weekError) {
            console.error(`Error fetching week ${week}:`, weekError);
            // Continue with next week
          }
        }
        
        console.log(`Total games fetched: ${allGames.length}`);
        
      } else {
        // For specific team view, use the team-specific systematic approach
        console.log(`Fetching games for specific team: ${selectedTeam}`);
        const teamGames = await footballApi.getTeamGames(selectedTeam, activeLeague);
        
        // Combine past and future games with proper week categorization
        // Note: currentWeek calculation removed as it's not used in this context
        
        allGames = [
          ...teamGames.pastGames.map(game => ({
            ...game,
            weekType: 'previous',
            week: game.week || 'Previous Week',
            weekNumber: extractWeekNumber(game.week)
          })),
          ...teamGames.futureGames.map(game => ({
            ...game,
            weekType: 'next',
            week: game.week || 'Next Week',
            weekNumber: extractWeekNumber(game.week)
          }))
        ];
        
        console.log(`Team games fetched: ${allGames.length} (${teamGames.pastGames.length} past, ${teamGames.futureGames.length} future)`);
      }
      
      // Extract unique teams for filter from all games
      const teams = new Set();
      allGames.forEach(game => {
        teams.add(game.homeTeam);
        teams.add(game.awayTeam);
      });
      setAvailableTeams(['all', ...Array.from(teams).sort()]);
      
      // Sort games by week number and date
      allGames.sort((a, b) => {
        // First sort by week number
        const weekA = a.weekNumber || 0;
        const weekB = b.weekNumber || 0;
        if (weekA !== weekB) return weekA - weekB;
        
        // Then sort by original date within the week (use originalDate if available)
        const dateA = new Date(a.originalDate || a.date);
        const dateB = new Date(b.originalDate || b.date);
        return dateA - dateB;
      });
      
      setGames(allGames);
      
    } catch (error) {
      console.error('Error loading games:', error);
    } finally {
      setLoading(false);
    }
  }, [activeLeague, selectedTeam]);

  // Load initial games
  useEffect(() => {
    loadGames();
  }, [loadGames]);

  // Reload games when team selection changes
  useEffect(() => {
    if (availableTeams.length > 0) {
      loadGames();
    }
  }, [selectedTeam, availableTeams.length, loadGames]);



  // Filter games by team
  const filterGamesByTeam = (games, team) => {
    if (team === 'all') return games;
    return games.filter(game => 
      game.homeTeam.toLowerCase().includes(team.toLowerCase()) ||
      game.awayTeam.toLowerCase().includes(team.toLowerCase())
    );
  };

  // Group games by date with proper sorting
  const groupGamesByDate = (games) => {
    const filteredGames = filterGamesByTeam(games, selectedTeam);
    
    // Sort games by week type and date (past games first)
    const sortedGames = filteredGames.sort((a, b) => {
      // First sort by week type: previous, current, next
      const weekTypeOrder = { 'previous': 0, 'current': 1, 'next': 2 };
      const typeA = weekTypeOrder[a.weekType] || 1;
      const typeB = weekTypeOrder[b.weekType] || 1;
      
      if (typeA !== typeB) {
        return typeA - typeB;
      }
      
      // Then sort by week number within each type
      const weekA = parseInt(a.week?.replace('Week ', '') || '0');
      const weekB = parseInt(b.week?.replace('Week ', '') || '0');
      return weekA - weekB;
    });
    
    const grouped = {};
    sortedGames.forEach(game => {
      const date = game.date || 'TBD';
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(game);
    });
    
    // Sort dates chronologically (past dates first) using original dates for sorting
    const sortedDates = Object.keys(grouped).sort((a, b) => {
      if (a === 'TBD') return 1;
      if (b === 'TBD') return -1;
      
      // Use original date if available, otherwise use the date string
      const dateA = grouped[a][0]?.originalDate || a;
      const dateB = grouped[b][0]?.originalDate || b;
      return new Date(dateA) - new Date(dateB);
    });
    
    // Create grouped object with user-friendly date formatting
    const sortedGrouped = {};
    sortedDates.forEach(date => {
      const userFriendlyDate = formatDateForDisplay(date);
      sortedGrouped[userFriendlyDate] = grouped[date];
    });
    
    return sortedGrouped;
  };


  // Navigation functions
  const navigateToHome = () => {
    setActivePage('home');
    navigate('/');
  };

  const navigateToStats = () => {
    setActivePage('stats');
    navigate('/stats');
  };

  const navigateToSchedule = () => {
    setActivePage('schedule');
    navigate('/schedule');
  };


  // Handle game click
  const handleGameClick = (game) => {
    navigate('/stats', { state: { game } });
  };

  const groupedGames = groupGamesByDate(games);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-10 h-10 bg-primary-600 rounded-lg">
                  <Trophy className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-black dark:text-white">Game Schedule</h1>
                  <p className="text-sm text-gray-700 dark:text-gray-300">Upcoming and past games</p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Navigation Tabs */}
              <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                <button
                  onClick={navigateToHome}
                  className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium transition-colors rounded-md ${
                    activePage === 'home' 
                      ? 'bg-primary-600 text-white' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-600'
                  }`}
                >
                  <Home className="w-4 h-4" />
                  <span>Home</span>
                </button>
                <button
                  onClick={navigateToStats}
                  className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium transition-colors rounded-md ${
                    activePage === 'stats' 
                      ? 'bg-primary-600 text-white' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-600'
                  }`}
                >
                  <BarChart3 className="w-4 h-4" />
                  <span>Stats</span>
                </button>
                <button
                  onClick={navigateToSchedule}
                  className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium transition-colors rounded-md ${
                    activePage === 'schedule' 
                      ? 'bg-primary-600 text-white' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-600'
                  }`}
                >
                  <Calendar className="w-4 h-4" />
                  <span>Schedule</span>
                </button>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <form onSubmit={handleSearch} className="flex items-center space-x-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search team..."
                      value={searchQuery}
                      onChange={handleSearchInputChange}
                      onFocus={() => searchQuery.length >= 2 && setShowSuggestions(true)}
                      onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                      className="pl-10 pr-4 py-2 w-48 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-3 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    Search
                  </button>
                </form>

                {/* Search Suggestions Dropdown */}
                {showSuggestions && searchSuggestions.length > 0 && (
                  <div className="absolute top-full left-0 mt-1 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
                    <div className="py-1">
                      {searchSuggestions.map((team, index) => (
                        <button
                          key={index}
                          onClick={() => handleSuggestionClick(team)}
                          className="w-full px-4 py-2 text-left text-sm text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                          <div className="flex items-center space-x-2">
                            <Search className="w-4 h-4 text-gray-400" />
                            <span>{team}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Dark Mode Toggle */}
              <button
                onClick={toggleDarkMode}
                className="px-3 py-3 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                aria-label="Toggle dark mode"
              >
                {isDarkMode ? (
                  <Sun className="w-4 h-4 text-yellow-500" />
                ) : (
                  <Moon className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Filter Controls */}
      <div className="sticky top-16 z-40 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
              >
                <Filter className="w-4 h-4" />
                <span className="text-sm font-medium">Filters</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </button>
              
              {selectedTeam !== 'all' && (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Filtered by:</span>
                  <span className="px-2 py-1 bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 rounded-md text-sm font-medium">
                    {selectedTeam}
                  </span>
                  <button
                    onClick={() => setSelectedTeam('all')}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    ×
                  </button>
                </div>
              )}
            </div>

            <div className="text-sm text-gray-500 dark:text-gray-400">
              {filterGamesByTeam(games, selectedTeam).length} games shown
            </div>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="max-w-md">
                {/* Team Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Select Team to View Full Season Schedule
                  </label>
                  <select
                    value={selectedTeam}
                    onChange={(e) => setSelectedTeam(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    {availableTeams.map(team => (
                      <option key={team} value={team}>
                        {team === 'all' ? 'All Teams (All Games)' : `${team} (Complete Season)`}
                      </option>
                    ))}
                  </select>
                </div>
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  Select a team to view their complete regular season schedule. Past games are shown at the top with final scores.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : (
          <div>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {selectedTeam === 'all' 
                    ? `${activeLeague.toUpperCase()} Schedule - All Games`
                    : `${selectedTeam} - Complete Season Schedule`
                  }
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {selectedTeam === 'all' 
                    ? 'Showing past, current, and upcoming games'
                    : `Complete regular season schedule for ${selectedTeam} with past games at the top`
                  }
                </p>
              </div>
              
              {/* League Tabs */}
              <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                <button
                  onClick={() => setActiveLeague('nfl')}
                  className={`tab-button ${activeLeague === 'nfl' ? 'active' : 'inactive'}`}
                >
                  NFL
                </button>
                <button
                  onClick={() => setActiveLeague('ncaa')}
                  className={`tab-button ${activeLeague === 'ncaa' ? 'active' : 'inactive'}`}
                >
                  NCAA
                </button>
              </div>
            </div>
            <div className="space-y-8">
            {Object.entries(groupedGames).map(([date, dateGames]) => (
              <div key={date} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                {/* Date Header */}
                <div className="bg-primary-50 dark:bg-primary-900/20 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                    <h2 className="text-lg font-semibold text-primary-900 dark:text-primary-100">
                      {date}
                    </h2>
                    <span className="text-sm text-primary-700 dark:text-primary-300">
                      {dateGames.length} game{dateGames.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>

                {/* Games List */}
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {dateGames.map((game, index) => (
                    <div
                      key={`${game.id}-${index}`}
                      onClick={() => handleGameClick(game)}
                      className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-4">
                            <div className="text-center">
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {game.awayTeam}
                              </div>
                              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                                {game.awayScore || '--'}
                              </div>
                            </div>
                            
                            <div className="text-center">
                              <div className="text-xs text-gray-500 dark:text-gray-400">VS</div>
                              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                {game.status}
                              </div>
                            </div>
                            
                            <div className="text-center">
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {game.homeTeam}
                              </div>
                              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                                {game.homeScore || '--'}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                          <div className="flex items-center space-x-1">
                            <MapPin className="w-4 h-4" />
                            <span>{game.week}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* End of Games */}
            {games.length > 0 && (
              <div className="text-center py-8">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Showing {filterGamesByTeam(games, selectedTeam).length} of {games.length} total games
                </div>
              </div>
            )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SchedulePage;
