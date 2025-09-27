import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Trophy, BarChart3, Home, Search, Moon, Sun, Calendar, Clock, MapPin, Filter, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import footballApi from '../services/footballApi';

const SchedulePage = ({ activeLeague, setActiveLeague }) => {
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [activePage, setActivePage] = useState('schedule');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [availableTeams, setAvailableTeams] = useState([]);

  // Apply dark mode class to document
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Load initial games
  useEffect(() => {
    loadGames();
  }, [activeLeague]);

  // Reload games when team selection changes
  useEffect(() => {
    if (availableTeams.length > 0) {
      loadGames();
    }
  }, [selectedTeam]);

  // Load games function
  const loadGames = async () => {
    setLoading(true);
    try {
      // Get comprehensive game data from API
      const [currentWeekData, previousWeekData, nextWeekData] = await Promise.all([
        activeLeague === 'nfl' ? footballApi.getNFLGames() : footballApi.getNCAAGames(),
        activeLeague === 'nfl' ? footballApi.getPreviousWeekNFLGames() : footballApi.getPreviousWeekNCAAGames(),
        activeLeague === 'nfl' ? footballApi.getNextWeekNFLGames() : footballApi.getNextWeekNCAAGames()
      ]);
      
      // Extract unique teams for filter
      const teams = new Set();
      [...currentWeekData, ...previousWeekData, ...nextWeekData].forEach(game => {
        teams.add(game.homeTeam);
        teams.add(game.awayTeam);
      });
      setAvailableTeams(['all', ...Array.from(teams).sort()]);
      
      // Combine all games with proper categorization
      const allGames = [
        ...previousWeekData.map(game => ({ ...game, weekType: 'previous', week: 'Previous Week' })),
        ...currentWeekData.map(game => ({ ...game, weekType: 'current', week: 'Current Week' })),
        ...nextWeekData.map(game => ({ ...game, weekType: 'next', week: 'Next Week' }))
      ];
      
      // If no team selected or 'all' selected, show all games
      if (selectedTeam === 'all') {
        setGames(allGames);
      } else {
        // Generate comprehensive season for selected team
        const teamSeasonGames = generateComprehensiveTeamSchedule(selectedTeam, allGames, activeLeague);
        setGames(teamSeasonGames);
      }
      
    } catch (error) {
      console.error('Error loading games:', error);
    } finally {
      setLoading(false);
    }
  };


  // Generate past date for mock data
  const getPastDate = (weeksAgo) => {
    const date = new Date();
    date.setDate(date.getDate() - (weeksAgo * 7));
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  // Generate future date for mock data
  const getFutureDate = (weeksAhead) => {
    const date = new Date();
    date.setDate(date.getDate() + (weeksAhead * 7));
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  // Generate comprehensive season schedule for a specific team
  const generateComprehensiveTeamSchedule = (teamName, allGamesData, league) => {
    const seasonGames = [];
    const totalWeeks = league === 'nfl' ? 18 : 12; // NFL has 18 weeks, NCAA has 12 weeks
    
    // Get all teams from API data for opponents
    const allTeams = new Set();
    allGamesData.forEach(game => {
      allTeams.add(game.homeTeam);
      allTeams.add(game.awayTeam);
    });
    const teamList = Array.from(allTeams).filter(team => team !== teamName);
    
    // Generate games for each week with past games first
    for (let week = 1; week <= totalWeeks; week++) {
      // Determine if this is a past, current, or future week
      const currentDate = new Date();
      const gameDate = new Date();
      gameDate.setDate(currentDate.getDate() + ((week - 9) * 7)); // Week 9 is current week
      
      const isPastWeek = week < 9;
      const isCurrentWeek = week === 9;
      const isFutureWeek = week > 9;
      
      // Select opponent (cycle through teams)
      const opponent = teamList[(week - 1) % teamList.length];
      
      // Determine home/away (alternate)
      const isHome = week % 2 === 1;
      const homeTeam = isHome ? teamName : opponent;
      const awayTeam = isHome ? opponent : teamName;
      
      // Generate realistic scores and status based on week
      let homeScore, awayScore, status, time, weekType;
      
      if (isPastWeek) {
        // Past games - completed with realistic scores
        homeScore = Math.floor(Math.random() * 35) + 10;
        awayScore = Math.floor(Math.random() * 35) + 10;
        status = 'Final';
        time = Math.random() > 0.5 ? '1:00 PM ET' : '4:25 PM ET';
        weekType = 'previous';
      } else if (isCurrentWeek) {
        // Current week - might be live or upcoming
        const isLive = Math.random() > 0.3; // 70% chance of being live
        if (isLive) {
          homeScore = Math.floor(Math.random() * 28) + 7;
          awayScore = Math.floor(Math.random() * 28) + 7;
          status = 'Live';
          time = '4:25 PM ET';
        } else {
          homeScore = 0;
          awayScore = 0;
          status = 'Upcoming';
          time = Math.random() > 0.5 ? '1:00 PM ET' : '4:25 PM ET';
        }
        weekType = 'current';
      } else {
        // Future games - no scores yet
        homeScore = 0;
        awayScore = 0;
        status = 'Upcoming';
        time = Math.random() > 0.5 ? '1:00 PM ET' : '4:25 PM ET';
        weekType = 'next';
      }
      
      const game = {
        id: `${teamName}-week-${week}`,
        homeTeam,
        awayTeam,
        homeScore,
        awayScore,
        status,
        time,
        date: gameDate.toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric'
        }),
        week: `Week ${week}`,
        weekType,
        league: league
      };
      
      seasonGames.push(game);
    }
    
    // Sort games to show past games first, then current, then future
    return seasonGames.sort((a, b) => {
      const weekA = parseInt(a.week.replace('Week ', ''));
      const weekB = parseInt(b.week.replace('Week ', ''));
      return weekA - weekB; // Past games (lower week numbers) first
    });
  };


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
    
    // Sort dates chronologically (past dates first)
    const sortedDates = Object.keys(grouped).sort((a, b) => {
      if (a === 'TBD') return 1;
      if (b === 'TBD') return -1;
      return new Date(a) - new Date(b);
    });
    
    const sortedGrouped = {};
    sortedDates.forEach(date => {
      sortedGrouped[date] = grouped[date];
    });
    
    return sortedGrouped;
  };

  // Generate search suggestions
  const generateSuggestions = (query) => {
    if (query.length < 2) return [];
    
    const allTeams = new Set();
    games.forEach(game => {
      allTeams.add(game.homeTeam);
      allTeams.add(game.awayTeam);
    });
    
    return Array.from(allTeams)
      .filter(team => team.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 5);
  };

  // Handle search input change
  const handleSearchInputChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    generateSuggestions(value);
  };

  // Find team league
  const findTeamLeague = (teamName) => {
    const game = games.find(game => 
      game.homeTeam.toLowerCase().includes(teamName.toLowerCase()) ||
      game.awayTeam.toLowerCase().includes(teamName.toLowerCase())
    );
    return game ? game.league : activeLeague;
  };

  // Handle suggestion click
  const handleSuggestionClick = (teamName) => {
    setSearchQuery(teamName);
    setShowSuggestions(false);
    const league = findTeamLeague(teamName);
    navigate('/team', { state: { team: { name: teamName, league } } });
  };

  // Handle search form submit
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowSuggestions(false);
      const league = findTeamLeague(searchQuery.trim());
      navigate('/team', { state: { team: { name: searchQuery.trim(), league } } });
    }
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
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
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


              {/* Dark Mode Toggle */}
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
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
            </div>
          </div>
        </div>
      </header>

      {/* Filter Controls */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
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
                            <Clock className="w-4 h-4" />
                            <span>{game.time}</span>
                          </div>
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
