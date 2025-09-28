import React, { useState, useEffect } from 'react';
import { ArrowLeft, Trophy, BarChart3, Calendar, Home, Search, Moon, Sun } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import footballApi from '../services/footballApi';
import sportsApiService from '../services/sportsApi';
import { useDarkMode } from '../contexts/DarkModeContext';

const TeamPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const [team, setTeam] = useState(null);
  const [teamGames, setTeamGames] = useState([]);
  const [teamStats, setTeamStats] = useState(null);
  const [rosterStats, setRosterStats] = useState(null);
  const [rosterLoading, setRosterLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeLeague, setActiveLeague] = useState('nfl');
  const [activePage, setActivePage] = useState('team');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [allGames, setAllGames] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Get team from location state
  const teamFromState = location.state?.team;

  useEffect(() => {
    if (teamFromState) {
      setTeam(teamFromState);
      setActiveLeague(teamFromState.league);
      loadTeamData(teamFromState);
      loadRosterStats(teamFromState);
      setLastUpdated(new Date());
    }
  }, [teamFromState]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-refresh functionality for real-time updates
  useEffect(() => {
    if (!autoRefresh || !team) return;

    const interval = setInterval(() => {
      console.log('Auto-refreshing team data...');
      loadTeamData(team);
      setLastUpdated(new Date());
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [autoRefresh, team]); // eslint-disable-line react-hooks/exhaustive-deps


  // Load all games for search functionality
  useEffect(() => {
    loadAllGames();
  }, []);

  // Search functionality
  const generateSuggestions = (query) => {
    if (!query || query.length < 2) {
      setSearchSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const teamNames = new Set();
    
    allGames.forEach(game => {
      if (game.homeTeam.toLowerCase().includes(query.toLowerCase())) {
        teamNames.add(game.homeTeam);
      }
      if (game.awayTeam.toLowerCase().includes(query.toLowerCase())) {
        teamNames.add(game.awayTeam);
      }
    });

    const suggestions = Array.from(teamNames).slice(0, 5);
    setSearchSuggestions(suggestions);
    setShowSuggestions(suggestions.length > 0);
  };

  const handleSearchInputChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    generateSuggestions(value);
  };

  const findTeamLeague = (teamName) => {
    const game = allGames.find(game => 
      game.homeTeam.toLowerCase().includes(teamName.toLowerCase()) ||
      game.awayTeam.toLowerCase().includes(teamName.toLowerCase())
    );
    return game ? game.league : 'nfl';
  };

  const handleSuggestionClick = (teamName) => {
    setSearchQuery(teamName);
    setShowSuggestions(false);
    const league = findTeamLeague(teamName);
    navigate('/team', { state: { team: { name: teamName, league } } });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowSuggestions(false);
      const league = findTeamLeague(searchQuery.trim());
      navigate('/team', { state: { team: { name: searchQuery.trim(), league } } });
    }
  };

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


  const loadAllGames = async () => {
    try {
      const [nflGames, ncaaGames] = await Promise.all([
        footballApi.getNFLGames(),
        footballApi.getNCAAGames()
      ]);
      setAllGames([...nflGames, ...ncaaGames]);
    } catch (error) {
      console.error('Error loading games for search:', error);
    }
  };

  // Helper function to get current week

  const loadTeamData = async (teamData) => {
    setLoading(true);
    try {
      console.log('=== LOADING TEAM DATA ===');
      console.log('Team:', teamData.name);
      console.log('League:', teamData.league);
      console.log('========================');
      
      // Fetch real team games from ESPN API
      const gamesData = await footballApi.getTeamGames(teamData.name, teamData.league);
      console.log(`Raw games data received:`, gamesData);
      
      const { pastGames, futureGames } = gamesData;
      
      // Combine past and future games, with past games first
      const allTeamGames = [...pastGames, ...futureGames];
      
      console.log(`=== ESPN API RESULTS FOR ${teamData.name.toUpperCase()} ===`);
      console.log(`Past games: ${pastGames.length}`);
      console.log(`Future games: ${futureGames.length}`);
      console.log(`Total games: ${allTeamGames.length}`);
      console.log('Sample past game:', pastGames[0]);
      console.log('Sample future game:', futureGames[0]);
      console.log('All team games array:', allTeamGames);
      console.log('==========================================');

      // Only use real ESPN data - no fallback to mock data
      if (allTeamGames.length > 0) {
        console.log('✅ Using real ESPN data');
        console.log('Setting team games state with:', allTeamGames.length, 'games');
        setTeamGames(allTeamGames);
        
        // Get comprehensive team statistics from ESPN API
        const comprehensiveStats = await footballApi.getTeamStats(teamData.name, teamData.league);
        if (comprehensiveStats) {
          setTeamStats(comprehensiveStats);
          console.log('Comprehensive team stats from ESPN API:', comprehensiveStats);
        } else {
          // Fallback to basic calculation if API fails
          const stats = calculateTeamStats(allTeamGames, teamData.name);
          setTeamStats(stats);
          console.log('Fallback team stats calculated:', stats);
        }
      } else {
        console.log('❌ No real games found from ESPN API - showing empty state');
        setTeamGames([]);
        setTeamStats(null);
      }

    } catch (error) {
      console.error('❌ Error loading team data from ESPN API:', error);
      console.log('ESPN API failed - showing empty state instead of mock data');
      setTeamGames([]);
      setTeamStats(null);
    } finally {
      setLoading(false);
    }
  };

  // Load team roster stats
  const loadRosterStats = async (teamData) => {
    setRosterLoading(true);
    try {
      console.log('Loading roster stats for:', teamData.name);
      
      // For now, we'll need to get the team ID from the team data
      // This is a simplified approach - in a real implementation, you'd need to map team names to IDs
      const teamId = getTeamIdFromName(teamData.name, teamData.league);
      
      if (teamId) {
        const roster = await footballApi.getTeamRoster(teamId, teamData.league);
        console.log('Roster loaded:', roster);
        setRosterStats(roster);
      } else {
        console.log('No team ID found for:', teamData.name);
        // Generate mock roster data as fallback
        const mockRoster = generateMockRoster(teamData.name);
        setRosterStats(mockRoster);
      }
    } catch (error) {
      console.error('Error loading roster stats:', error);
      // Fallback to mock roster data
      const mockRoster = generateMockRoster(teamData.name);
      setRosterStats(mockRoster);
    } finally {
      setRosterLoading(false);
    }
  };

  // Helper function to get team ID from team name (simplified mapping)
  const getTeamIdFromName = (teamName, league) => {
    // This is a simplified mapping - in a real implementation, you'd have a comprehensive mapping
    const teamIdMap = {
      'nfl': {
        'Arizona Cardinals': '22',
        'Atlanta Falcons': '1',
        'Baltimore Ravens': '33',
        'Buffalo Bills': '2',
        'Carolina Panthers': '29',
        'Chicago Bears': '3',
        'Cincinnati Bengals': '4',
        'Cleveland Browns': '5',
        'Dallas Cowboys': '6',
        'Denver Broncos': '7',
        'Detroit Lions': '8',
        'Green Bay Packers': '9',
        'Houston Texans': '34',
        'Indianapolis Colts': '11',
        'Jacksonville Jaguars': '30',
        'Kansas City Chiefs': '12',
        'Las Vegas Raiders': '13',
        'Los Angeles Chargers': '24',
        'Los Angeles Rams': '14',
        'Miami Dolphins': '15',
        'Minnesota Vikings': '16',
        'New England Patriots': '17',
        'New Orleans Saints': '18',
        'New York Giants': '19',
        'New York Jets': '20',
        'Philadelphia Eagles': '21',
        'Pittsburgh Steelers': '23',
        'San Francisco 49ers': '25',
        'Seattle Seahawks': '26',
        'Tampa Bay Buccaneers': '27',
        'Tennessee Titans': '10',
        'Washington Commanders': '28'
      }
    };
    
    return teamIdMap[league]?.[teamName] || null;
  };

  // Generate mock roster data
  const generateMockRoster = (teamName) => {
    const positions = [
      { pos: 'QB', count: 3 },
      { pos: 'RB', count: 4 },
      { pos: 'WR', count: 6 },
      { pos: 'TE', count: 3 },
      { pos: 'OL', count: 8 },
      { pos: 'DL', count: 6 },
      { pos: 'LB', count: 6 },
      { pos: 'CB', count: 5 },
      { pos: 'S', count: 4 },
      { pos: 'K', count: 1 },
      { pos: 'P', count: 1 }
    ];

    const roster = [];
    let playerId = 1;

    positions.forEach(({ pos, count }) => {
      for (let i = 0; i < count; i++) {
        roster.push({
          id: `player-${playerId++}`,
          name: `Player ${playerId}`,
          position: pos,
          jersey: Math.floor(Math.random() * 99) + 1,
          height: `${Math.floor(Math.random() * 6) + 5}'${Math.floor(Math.random() * 12)}"`,
          weight: Math.floor(Math.random() * 100) + 180,
          age: Math.floor(Math.random() * 10) + 22,
          experience: Math.floor(Math.random() * 8) + 1
        });
      }
    });

    return roster;
  };

  // Generate a complete season of games for a team (legacy function - kept for compatibility)

  const calculateTeamStats = (games, teamName) => {
    const teamGames = games.filter(game => 
      game.awayTeam === teamName || game.homeTeam === teamName
    );

    let wins = 0;
    let losses = 0;
    let ties = 0;
    let totalPointsFor = 0;
    let totalPointsAgainst = 0;
    let homeGames = 0;
    let awayGames = 0;
    let homeWins = 0;
    let awayWins = 0;

    teamGames.forEach(game => {
      if (game.status === 'Final') {
        const isHomeTeam = game.homeTeam === teamName;
        const teamScore = isHomeTeam ? game.homeScore : game.awayScore;
        const opponentScore = isHomeTeam ? game.awayScore : game.homeScore;

        totalPointsFor += teamScore;
        totalPointsAgainst += opponentScore;

        if (isHomeTeam) {
          homeGames++;
          if (teamScore > opponentScore) homeWins++;
        } else {
          awayGames++;
          if (teamScore > opponentScore) awayWins++;
        }

        if (teamScore > opponentScore) {
          wins++;
        } else if (teamScore < opponentScore) {
          losses++;
        } else {
          ties++;
        }
      }
    });

    const totalGames = wins + losses + ties;
    const winPercentage = totalGames > 0 ? (wins / totalGames * 100).toFixed(1) : 0;
    const pointDifferential = totalPointsFor - totalPointsAgainst;
    const pointsPerGame = totalGames > 0 ? (totalPointsFor / totalGames).toFixed(1) : 0;
    const pointsAllowedPerGame = totalGames > 0 ? (totalPointsAgainst / totalGames).toFixed(1) : 0;

    return {
      totalGames,
      wins,
      losses,
      ties,
      winPercentage,
      totalPointsFor,
      totalPointsAgainst,
      pointDifferential,
      pointsPerGame,
      pointsAllowedPerGame,
      homeGames,
      awayGames,
      homeWins,
      awayWins,
      homeWinPercentage: homeGames > 0 ? (homeWins / homeGames * 100).toFixed(1) : 0,
      awayWinPercentage: awayGames > 0 ? (awayWins / awayGames * 100).toFixed(1) : 0
    };
  };

  const handleGameClick = (game) => {
    navigate('/stats', { state: { game: { ...game, league: activeLeague } } });
  };

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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
            {/* Team Statistics Overview */}
            {teamStats && (
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
                    <BarChart3 className="w-6 h-6 mr-3 text-primary-600" />
                    Season Statistics
                    <span className="ml-3 px-3 py-1 text-xs font-medium bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200 rounded-full">
                      {team.league?.toUpperCase()}
                    </span>
                  </h2>
                  
                  <div className="flex items-center space-x-4">
                    {lastUpdated && (
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        Last updated: {lastUpdated.toLocaleTimeString()}
                      </div>
                    )}
                    
                    <div className="flex items-center space-x-2">
                      <label className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                        <input
                          type="checkbox"
                          checked={autoRefresh}
                          onChange={(e) => setAutoRefresh(e.target.checked)}
                          className="mr-2 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                        Auto-refresh
                      </label>
                      
                      <button
                        onClick={() => {
                          loadTeamData(team);
                          setLastUpdated(new Date());
                        }}
                        className="px-3 py-1 text-sm bg-primary-600 text-white rounded hover:bg-primary-700 transition-colors"
                      >
                        Refresh
                      </button>
                      
        <button
          onClick={() => {
            console.log('=== CACHE DEBUG ===');
            sportsApiService.getCacheStats();
            sportsApiService.clearExpiredCache();
          }}
          className="px-3 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
          title="Debug cache and clear expired entries"
        >
          Cache Debug
        </button>
        <button
          onClick={async () => {
            console.log('=== API CONNECTIVITY TEST ===');
            const isWorking = await sportsApiService.testApiConnectivity();
            console.log(`API is working: ${isWorking}`);
          }}
          className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          title="Test API connectivity"
        >
          Test API
        </button>
        <button
          onClick={() => {
            console.log('=== CLEARING ALL CACHE ===');
            sportsApiService.clearCache();
            console.log('Cache cleared! Refreshing team data...');
            loadTeamData(team);
            setLastUpdated(new Date());
          }}
          className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          title="Clear all cache and refresh data"
        >
          Clear Cache
        </button>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Record */}
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Record</h3>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {teamStats.wins}-{teamStats.losses}{teamStats.ties > 0 && `-${teamStats.ties}`}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {teamStats.winPercentage}% win rate
                    </div>
                    {teamStats.currentStreak > 0 && (
                      <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                        {teamStats.currentStreakType}{teamStats.currentStreak} streak
                      </div>
                    )}
                  </div>

                  {/* Points */}
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Points</h3>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {teamStats.pointsPerGame}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      points per game
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {teamStats.totalPointsFor} total
                    </div>
                  </div>

                  {/* Point Differential */}
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Point Differential</h3>
                    <div className={`text-2xl font-bold ${teamStats.pointDifferential >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {teamStats.pointDifferential >= 0 ? '+' : ''}{teamStats.pointDifferential}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      total differential
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {teamStats.pointsAllowedPerGame} allowed/game
                    </div>
                  </div>

                  {/* Home/Away Record */}
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Home/Away</h3>
                    <div className="text-lg font-bold text-gray-900 dark:text-white">
                      {teamStats.homeWins}-{teamStats.homeGames - teamStats.homeWins} / {teamStats.awayWins}-{teamStats.awayGames - teamStats.awayWins}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      home / away record
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {teamStats.homeWinPercentage}% / {teamStats.awayWinPercentage}%
                    </div>
                  </div>
                </div>

                {/* Detailed Stats */}
                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-lg font-semibold text-gray-900 dark:text-white">
                      {teamStats.totalPointsFor}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Points For</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-gray-900 dark:text-white">
                      {teamStats.totalPointsAgainst}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Points Against</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-gray-900 dark:text-white">
                      {teamStats.totalGames}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Total Games</div>
                  </div>
                </div>

                {/* Advanced Statistics */}
                {(teamStats.longestWinStreak > 0 || teamStats.longestLossStreak > 0 || teamStats.recentForm) && (
                  <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {teamStats.longestWinStreak > 0 && (
                      <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                        <h3 className="text-sm font-medium text-green-800 dark:text-green-200 mb-2">Longest Win Streak</h3>
                        <div className="text-2xl font-bold text-green-900 dark:text-green-100">
                          {teamStats.longestWinStreak}
                        </div>
                        <div className="text-sm text-green-600 dark:text-green-300">
                          consecutive wins
                        </div>
                      </div>
                    )}
                    
                    {teamStats.longestLossStreak > 0 && (
                      <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
                        <h3 className="text-sm font-medium text-red-800 dark:text-red-200 mb-2">Longest Loss Streak</h3>
                        <div className="text-2xl font-bold text-red-900 dark:text-red-100">
                          {teamStats.longestLossStreak}
                        </div>
                        <div className="text-sm text-red-600 dark:text-red-300">
                          consecutive losses
                        </div>
                      </div>
                    )}

                    {teamStats.recentForm && (
                      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                        <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">Recent Form</h3>
                        <div className="text-lg font-bold text-blue-900 dark:text-blue-100">
                          {teamStats.recentForm.wins}-{teamStats.recentForm.losses}-{teamStats.recentForm.ties}
                        </div>
                        <div className="text-sm text-blue-600 dark:text-blue-300">
                          last 5 games
                        </div>
                        <div className="text-xs text-blue-500 dark:text-blue-400 mt-1 font-mono">
                          {teamStats.recentForm.form}
                        </div>
                      </div>
                    )}

                    <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                      <h3 className="text-sm font-medium text-purple-800 dark:text-purple-200 mb-2">Season</h3>
                      <div className="text-lg font-bold text-purple-900 dark:text-purple-100">
                        {teamStats.season || new Date().getFullYear()}
                      </div>
                      <div className="text-sm text-purple-600 dark:text-purple-300">
                        {team.league?.toUpperCase()}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Complete Season Match History */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              {console.log('=== RENDER DEBUG ===', {
                teamGamesLength: teamGames.length,
                teamGames: teamGames,
                teamGamesType: typeof teamGames,
                isArray: Array.isArray(teamGames)
              })}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
                  <Calendar className="w-6 h-6 mr-3 text-primary-600" />
                  Complete Season Match History ({teamGames.length} games)
                  <span className="ml-3 px-3 py-1 text-xs font-medium bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200 rounded-full">
                    {team.league?.toUpperCase()}
                  </span>
                  {loading && (
                    <div className="ml-4 flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600 mr-2"></div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">Loading games...</span>
                    </div>
                  )}
                </h2>
                
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Real-time data from ESPN API
                </div>
              </div>
              
              {teamGames.length > 0 ? (
                <div className="space-y-6">
                  {/* Match History Summary */}
                  {(() => {
                    const pastGames = teamGames.filter(game => game.status === 'Final' || game.status === 'Live');
                    const futureGames = teamGames.filter(game => game.status === 'Scheduled');
                    const liveGames = teamGames.filter(game => game.status === 'Live');
                    
                    return (
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-gray-900 dark:text-white">
                              {pastGames.length}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Games Played</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-gray-900 dark:text-white">
                              {futureGames.length}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Upcoming Games</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-red-600">
                              {liveGames.length}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Live Games</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">
                              {teamGames.length}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Total Games</div>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                  
                  {/* Past Games Section */}
                  {(() => {
                    const pastGames = teamGames.filter(game => game.status === 'Final' || game.status === 'Live');
                    const futureGames = teamGames.filter(game => game.status === 'Scheduled');
                    
                    return (
                      <>
                        {/* Past Games */}
                        {pastGames.length > 0 && (
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                              <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                              Past Games ({pastGames.length})
                            </h3>
                            <div className="space-y-3">
                              {pastGames
                                .sort((a, b) => {
                                  const dateA = new Date(a.date);
                                  const dateB = new Date(b.date);
                                  return dateB - dateA;
                                })
                                .map((game) => (
                                  <div
                                    key={game.id}
                                    onClick={() => handleGameClick(game)}
                                    className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                                  >
                                    <div className="flex items-center justify-between">
                                      <div className="flex-1">
                                        <div className="flex items-center space-x-4">
                                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                                            {game.awayTeam} @ {game.homeTeam}
                                          </div>
                                          <div className="text-sm text-gray-500 dark:text-gray-400">
                                            {game.date} • {game.time}
                                          </div>
                                        </div>
                                        <div className="flex items-center space-x-4 mt-1">
                                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                            game.status === 'Final'
                                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                              : game.status === 'Live'
                                              ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                              : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                                          }`}>
                                            {game.status}
                                          </span>
                                          <span className="text-sm text-gray-600 dark:text-gray-300">
                                            {game.awayScore} - {game.homeScore}
                                          </span>
                                          <span className="text-xs text-gray-500 dark:text-gray-400">
                                            {game.week}
                                          </span>
                                          {game.status === 'Final' && (
                                            <span className={`text-xs font-medium ${
                                              (game.homeTeam === team.name && game.homeScore > game.awayScore) ||
                                              (game.awayTeam === team.name && game.awayScore > game.homeScore)
                                                ? 'text-green-600'
                                                : 'text-red-600'
                                            }`}>
                                              {(game.homeTeam === team.name && game.homeScore > game.awayScore) ||
                                               (game.awayTeam === team.name && game.awayScore > game.homeScore)
                                                ? 'W'
                                                : 'L'}
                                            </span>
                                          )}
                                          {game.opponent && (
                                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                              vs {game.opponent}
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                      <div className="text-sm text-gray-500 dark:text-gray-400">
                                        Click to view stats
                                      </div>
                                    </div>
                                  </div>
                                ))}
                            </div>
                          </div>
                        )}

                        {/* Future Games */}
                        {futureGames.length > 0 && (
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                              <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                              Upcoming Games ({futureGames.length})
                            </h3>
                            <div className="space-y-3">
                              {futureGames
                                .sort((a, b) => {
                                  const dateA = new Date(a.date);
                                  const dateB = new Date(b.date);
                                  return dateA - dateB;
                                })
                                .map((game) => (
                                  <div
                                    key={game.id}
                                    onClick={() => handleGameClick(game)}
                                    className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                                  >
                                    <div className="flex items-center justify-between">
                                      <div className="flex-1">
                                        <div className="flex items-center space-x-4">
                                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                                            {game.awayTeam} @ {game.homeTeam}
                                          </div>
                                          <div className="text-sm text-gray-500 dark:text-gray-400">
                                            {game.date} • {game.time}
                                          </div>
                                        </div>
                                        <div className="flex items-center space-x-4 mt-1">
                                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                            game.status === 'Final'
                                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                              : game.status === 'Live'
                                              ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                              : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                                          }`}>
                                            {game.status}
                                          </span>
                                          <span className="text-sm text-gray-600 dark:text-gray-300">
                                            {game.awayScore !== null ? `${game.awayScore} - ${game.homeScore}` : 'TBD'}
                                          </span>
                                          <span className="text-xs text-gray-500 dark:text-gray-400">
                                            {game.week}
                                          </span>
                                        </div>
                                      </div>
                                      <div className="text-sm text-gray-500 dark:text-gray-400">
                                        Click to view stats
                                      </div>
                                    </div>
                                  </div>
                                ))}
                            </div>
                          </div>
                        )}
                      </>
                    );
                  })()}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Calendar className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-300 mb-2">
                    No Games Found
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    No games found for {team.name} this season
                  </p>
                </div>
              )}
            </div>

            {/* Team Roster Stats Section */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                <Trophy className="w-6 h-6 mr-3 text-primary-600" />
                Team Roster
                <span className="ml-3 px-3 py-1 text-xs font-medium bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200 rounded-full">
                  {rosterStats ? rosterStats.length : 0} Players
                </span>
                <button
                  onClick={async () => {
                    console.log('=== TESTING ESPN API ===');
                    const testResult = await footballApi.testESPNConnection(team.name, team.league);
                    console.log('Test result:', testResult);
                  }}
                  className="ml-4 px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Test ESPN API
                </button>
              </h2>
              
              {/* Fallback Data Notice */}
              {rosterStats && rosterStats.length > 0 && rosterStats[0]?.isFallback && (
                <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-yellow-800 dark:text-yellow-200">
                        <strong>Note:</strong> Roster data is currently unavailable from ESPN API. Displaying sample roster data.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              {rosterLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-400">Loading roster data...</p>
                  </div>
                </div>
              ) : rosterStats && rosterStats.length > 0 ? (
                <div className="space-y-6">
                  {/* Roster Summary */}
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {Object.entries(
                      rosterStats.reduce((acc, player) => {
                        acc[player.position] = (acc[player.position] || 0) + 1;
                        return acc;
                      }, {})
                    ).map(([position, count]) => (
                      <div key={position} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 text-center">
                        <div className="text-lg font-bold text-gray-900 dark:text-white">{count}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">{position}</div>
                      </div>
                    ))}
                  </div>

                  {/* Player List */}
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Player
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Position
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Jersey
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Height
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Weight
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Age
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Experience
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {rosterStats.map((player) => (
                          <tr key={player.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {player.name}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                {player.position}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                              #{player.jersey}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                              {player.height}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                              {player.weight} lbs
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                              {player.age}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                              {player.experience} {player.experience === 1 ? 'year' : 'years'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Trophy className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-300 mb-2">
                    No Roster Data
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    Roster information is not available for {team?.name}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
   
  );
};

export default TeamPage;
