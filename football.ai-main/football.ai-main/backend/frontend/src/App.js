import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { Trophy, BarChart3, Star, RefreshCw, Moon, Sun, Search, Home, Calendar } from 'lucide-react';
import GameCard from './components/GameCard';
import GameStatsPage from './components/GameStatsPage';
import TeamPage from './components/TeamPageEnhanced';
import SchedulePage from './components/SchedulePage';
import ImportPage from './components/ImportPage';
import CedarChat from './components/CedarChat';
import footballApi from './services/footballApi';
import { DarkModeProvider, useDarkMode } from './contexts/DarkModeContext';
import { SearchProvider, useSearch } from './contexts/SearchContext';

// Main Dashboard Component
function Dashboard({ activeTab, setActiveTab }) {
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
  const [nflGames, setNflGames] = useState([]);
  const [ncaaGames, setNcaaGames] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [activePage, setActivePage] = useState('home');

  // Load games when component mounts or tab changes
  useEffect(() => {
    loadGames();
  }, [activeTab]); // eslint-disable-line react-hooks/exhaustive-deps


  // Auto-refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      loadGames();
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [activeTab]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadGames = async () => {
    setLoading(true);
    try {
      console.log('Loading games for:', activeTab);
      if (activeTab === 'nfl') {
        const games = await footballApi.getNFLGames();
        console.log('NFL games loaded:', games);
        setNflGames(games);
      } else {
        const games = await footballApi.getNCAAGames();
        console.log('NCAA games loaded:', games);
        setNcaaGames(games);
      }
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error loading games:', error);
    } finally {
      setLoading(false);
    }
  };

  const currentGames = activeTab === 'nfl' ? nflGames : ncaaGames;

  // Format date for display
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

  // Group games by date
  const groupGamesByDate = (games) => {
    const grouped = games.reduce((acc, game) => {
      const date = game.date || 'TBD';
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(game);
      return acc;
    }, {});

    // Sort dates and return as array of {date, games, displayDate}
    return Object.keys(grouped)
      .sort((a, b) => {
        // Sort by date, with 'TBD' at the end
        if (a === 'TBD') return 1;
        if (b === 'TBD') return -1;
        
        // Use original date if available, otherwise use the date string
        const dateA = grouped[a][0]?.originalDate || a;
        const dateB = grouped[b][0]?.originalDate || b;
        return new Date(dateA) - new Date(dateB);
      })
      .map(date => ({
        date,
        displayDate: formatDateForDisplay(date),
        games: grouped[date].sort((a, b) => {
          // Sort games within each date by time
          const timeA = a.time || '';
          const timeB = b.time || '';
          return timeA.localeCompare(timeB);
        })
      }));
  };

  const groupedGames = groupGamesByDate(currentGames);

  // Get current week from the games data
  const getCurrentWeek = (games) => {
    if (games.length === 0) return '1';
    
    // Find the most common week in the games
    const weekCounts = games.reduce((acc, game) => {
      const week = game.week || 'Week 1';
      // Ensure week is a string before calling replace
      const weekString = String(week);
      const weekNumber = weekString.replace('Week ', '');
      acc[weekNumber] = (acc[weekNumber] || 0) + 1;
      return acc;
    }, {});
    
    // Return the week with the most games
    const mostCommonWeek = Object.keys(weekCounts).reduce((a, b) => 
      weekCounts[a] > weekCounts[b] ? a : b
    );
    
    return mostCommonWeek;
  };

  const currentWeek = getCurrentWeek(currentGames);


  // Navigation functions
  const navigateToStats = () => {
    setActivePage('stats');
    navigate('/stats');
  };

  const navigateToSchedule = () => {
    setActivePage('schedule');
    navigate('/schedule');
  };


  const navigateToHome = () => {
    setActivePage('home');
    // Clear the saved game when navigating to home page
    localStorage.removeItem('selectedGame');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-10 h-10 bg-primary-600 rounded-lg">
                  <Trophy className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-black dark:text-white">Football AI</h1>
                  <p className="text-sm text-gray-700 dark:text-gray-300">Powered by AI Analytics</p>
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

      {/* Hero Section */}
      <section 
        className="hero-section"
        style={{
          background: 'linear-gradient(to right, #0ea5e9, #0369a1)',
          minHeight: '400px',
          paddingTop: '4rem',
          paddingBottom: '4rem'
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 drop-shadow-lg">
            AI-Powered Football Analytics
          </h2>
          <p className="text-xl text-white mb-8 max-w-3xl mx-auto opacity-90">
            Get instant insights, stats, and fun facts about your favorite {activeTab.toUpperCase()} games. 
            Discover the stories behind the plays with our advanced analytics.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
              <BarChart3 className="w-5 h-5 text-white" />
              <span className="text-white font-medium">Live Stats</span>
            </div>
            <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
              <Trophy className="w-5 h-5 text-white" />
              <span className="text-white font-medium">Game Analysis</span>
            </div>
            <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
              <Star className="w-5 h-5 text-white" />
              <span className="text-white font-medium">Fun Facts</span>
            </div>
          </div>
        </div>
      </section>

      {/* Games Section */}
      <section className="py-12 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <h3 className="text-2xl font-bold text-black dark:text-white">
                Recent Football Games for Week {currentWeek}
              </h3>
              {/* League Tabs */}
              <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                <button
                  onClick={() => setActiveTab('nfl')}
                  className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                    activeTab === 'nfl' 
                      ? 'bg-primary-600 text-white' 
                      : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white'
                  }`}
                >
                  NFL
                </button>
                <button
                  onClick={() => setActiveTab('ncaa')}
                  className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                    activeTab === 'ncaa' 
                      ? 'bg-primary-600 text-white' 
                      : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white'
                  }`}
                >
                  NCAA
                </button>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {lastUpdated && (
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Last updated: {lastUpdated.toLocaleTimeString()}
                </div>
              )}
              <button
                onClick={loadGames}
                disabled={loading}
                className="flex items-center space-x-2 px-3 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                <span>{loading ? 'Loading...' : 'Refresh'}</span>
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center space-x-3">
                <RefreshCw className="w-6 h-6 animate-spin text-primary-600" />
                <span className="text-lg text-gray-600 dark:text-gray-300">Loading games...</span>
              </div>
            </div>
          ) : currentGames.length === 0 ? (
            <div className="text-center py-12">
              <Trophy className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h4 className="text-xl font-semibold text-gray-600 dark:text-gray-300 mb-2">No Games Available</h4>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                No {activeTab.toUpperCase()} games found for today. Try refreshing or check back later.
              </p>
              <button
                onClick={loadGames}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                Refresh Games
              </button>
            </div>
          ) : (
            <div className="space-y-8">
              {groupedGames.map(({ date, displayDate, games }) => (
                <div key={date} className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="h-px bg-gray-200 dark:bg-gray-700 flex-1"></div>
                    <h4 className="text-lg font-semibold text-gray-700 dark:text-gray-300 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                      {displayDate}
                    </h4>
                    <div className="h-px bg-gray-200 dark:bg-gray-700 flex-1"></div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {games.map((game) => (
                      <GameCard key={game.id} game={game} league={activeTab} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-black dark:text-white mb-4">
              Why Choose Football AI?
            </h3>
            <p className="text-lg text-gray-700 dark:text-gray-300 max-w-2xl mx-auto">
              Experience football like never before with our AI-powered platform
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="w-8 h-8 text-primary-600" />
              </div>
                    <h4 className="text-xl font-semibold text-black dark:text-white mb-2">Real-time Analytics</h4>
                    <p className="text-gray-700 dark:text-gray-300">
                      Get instant access to advanced statistics, player performance metrics, and game insights.
                    </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-primary-600" />
              </div>
                    <h4 className="text-xl font-semibold text-black dark:text-white mb-2">Advanced Analytics</h4>
                    <p className="text-gray-700 dark:text-gray-300">
                      Deep dive into player performance, team statistics, and historical data with our comprehensive analytics.
                    </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trophy className="w-8 h-8 text-primary-600" />
              </div>
                    <h4 className="text-xl font-semibold text-black dark:text-white mb-2">Comprehensive Coverage</h4>
                    <p className="text-gray-700 dark:text-gray-300">
                      Follow both NFL and NCAA games with detailed analysis and historical context.
                    </p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}

// Main App Component with Router
function App() {
  const [activeTab, setActiveTab] = useState('nfl');
  
  return (
    <DarkModeProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Dashboard activeTab={activeTab} setActiveTab={setActiveTab} />} />
          <Route path="/stats" element={<GameStatsPage activeLeague={activeTab} setActiveLeague={setActiveTab} />} />
          <Route path="/schedule" element={<SchedulePage activeLeague={activeTab} setActiveLeague={setActiveTab} />} />
          <Route path="/import" element={<ImportPage />} />
          <Route path="/team" element={<TeamPage />} />
        </Routes>
        {/* Cedar Chat - Available on all pages */}
        <CedarChat />
      </Router>
    </DarkModeProvider>
  );
}

export default App;
