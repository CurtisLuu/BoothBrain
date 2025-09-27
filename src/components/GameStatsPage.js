import React, { useState, useEffect } from 'react';
import { Trophy, BarChart3, MessageCircle, Clock, Users, Award, Home, Search, Moon, Sun, Calendar } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import footballApi from '../services/footballApi';

// All Statistics Section Component
const AllStatisticsSection = ({ selectedGame }) => {
  const [playerStats, setPlayerStats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (selectedGame && selectedGame.id) {
      loadPlayerStatistics();
    }
  }, [selectedGame]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadPlayerStatistics = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Loading player statistics for game:', selectedGame.id);
      
      // For now, we'll use mock data since ESPN API requires specific event IDs
      // In a real implementation, you would call:
      // const gameSummary = await footballApi.getGameSummary(selectedGame.id, selectedGame.league);
      
      // Mock comprehensive player statistics
      const mockPlayerStats = generateMockPlayerStats(selectedGame);
      setPlayerStats(mockPlayerStats);
      
    } catch (err) {
      console.error('Error loading player statistics:', err);
      setError('Failed to load player statistics');
    } finally {
      setLoading(false);
    }
  };

  const generateMockPlayerStats = (game) => {
    const positions = ['QB', 'RB', 'WR', 'TE', 'OL', 'DL', 'LB', 'CB', 'S', 'K', 'P'];
    const teams = [game.awayTeam, game.homeTeam];
    const players = [];

    teams.forEach(team => {
      positions.forEach((position, index) => {
        const playerNumber = Math.floor(Math.random() * 99) + 1;
        const playerName = generatePlayerName();
        
        players.push({
          id: `${team}-${position}-${index}`,
          name: playerName,
          position: position,
          team: team,
          jersey: playerNumber,
          seasonStats: generatePositionStats(position, 'season'),
          careerStats: generatePositionStats(position, 'career'),
          gameStats: game.status === 'Scheduled' || game.status === 'Pre-Game' 
            ? generatePositionStats(position, 'game', true) 
            : generatePositionStats(position, 'game')
        });
      });
    });

    return players;
  };

  const generatePlayerName = () => {
    const firstNames = ['John', 'Mike', 'Chris', 'David', 'James', 'Robert', 'Michael', 'William', 'Richard', 'Thomas'];
    const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'];
    
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    
    return `${firstName} ${lastName}`;
  };

  const generatePositionStats = (position, type, isZero = false) => {
    if (isZero) {
      return {
        passingYards: 0, passingTDs: 0, passingINTs: 0,
        rushingYards: 0, rushingTDs: 0,
        receivingYards: 0, receivingTDs: 0, receptions: 0,
        tackles: 0, sacks: 0, interceptions: 0, fumbles: 0
      };
    }

    const baseMultiplier = type === 'career' ? 3 : type === 'season' ? 1.5 : 1;
    
    switch (position) {
      case 'QB':
        return {
          passingYards: Math.floor(Math.random() * 3000 * baseMultiplier) + 1000,
          passingTDs: Math.floor(Math.random() * 25 * baseMultiplier) + 5,
          passingINTs: Math.floor(Math.random() * 10 * baseMultiplier) + 1,
          rushingYards: Math.floor(Math.random() * 200 * baseMultiplier) + 50,
          rushingTDs: Math.floor(Math.random() * 5 * baseMultiplier) + 1
        };
      case 'RB':
        return {
          rushingYards: Math.floor(Math.random() * 1000 * baseMultiplier) + 500,
          rushingTDs: Math.floor(Math.random() * 10 * baseMultiplier) + 3,
          receivingYards: Math.floor(Math.random() * 300 * baseMultiplier) + 100,
          receivingTDs: Math.floor(Math.random() * 3 * baseMultiplier) + 1,
          receptions: Math.floor(Math.random() * 30 * baseMultiplier) + 10
        };
      case 'WR':
      case 'TE':
        return {
          receivingYards: Math.floor(Math.random() * 800 * baseMultiplier) + 300,
          receivingTDs: Math.floor(Math.random() * 8 * baseMultiplier) + 2,
          receptions: Math.floor(Math.random() * 50 * baseMultiplier) + 20
        };
      case 'LB':
      case 'DL':
        return {
          tackles: Math.floor(Math.random() * 80 * baseMultiplier) + 30,
          sacks: Math.floor(Math.random() * 8 * baseMultiplier) + 2,
          fumbles: Math.floor(Math.random() * 3 * baseMultiplier) + 1
        };
      case 'CB':
      case 'S':
        return {
          tackles: Math.floor(Math.random() * 60 * baseMultiplier) + 20,
          interceptions: Math.floor(Math.random() * 5 * baseMultiplier) + 1,
          fumbles: Math.floor(Math.random() * 2 * baseMultiplier) + 1
        };
      default:
        return {
          tackles: Math.floor(Math.random() * 20 * baseMultiplier) + 5
        };
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <span className="ml-3 text-gray-600 dark:text-gray-300">Loading player statistics...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="text-center py-12">
          <div className="text-red-500 mb-4">⚠️ {error}</div>
          <button 
            onClick={loadPlayerStatistics}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!selectedGame) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="text-center py-12">
          <Users className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-300 mb-2">
            Select a Game
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Choose a game from the sidebar to view comprehensive player statistics
          </p>
        </div>
      </div>
    );
  }

  // Group players by team
  const awayTeamPlayers = playerStats.filter(player => player.team === selectedGame.awayTeam);
  const homeTeamPlayers = playerStats.filter(player => player.team === selectedGame.homeTeam);

  return (
    <div className="space-y-6">
      {/* Team Statistics Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TeamStatsOverview team={selectedGame.awayTeam} players={awayTeamPlayers} />
        <TeamStatsOverview team={selectedGame.homeTeam} players={homeTeamPlayers} />
      </div>

      {/* Detailed Player Statistics */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <Award className="w-5 h-5 mr-2 text-primary-600" />
          Detailed Player Statistics
        </h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h4 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-3">
              {selectedGame.awayTeam}
            </h4>
            <div className="space-y-3">
              {awayTeamPlayers.map(player => (
                <PlayerCard key={player.id} player={player} />
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-3">
              {selectedGame.homeTeam}
            </h4>
            <div className="space-y-3">
              {homeTeamPlayers.map(player => (
                <PlayerCard key={player.id} player={player} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Team Statistics Overview Component
const TeamStatsOverview = ({ team, players }) => {
  const totalStats = players.reduce((acc, player) => {
    Object.keys(player.seasonStats).forEach(stat => {
      acc[stat] = (acc[stat] || 0) + (player.seasonStats[stat] || 0);
    });
    return acc;
  }, {});

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
        <Users className="w-5 h-5 mr-2 text-primary-600" />
        {team} Season Totals
      </h3>
      
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600 dark:text-gray-300">Passing Yards</span>
          <span className="font-medium text-gray-900 dark:text-white">{totalStats.passingYards || 0}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600 dark:text-gray-300">Rushing Yards</span>
          <span className="font-medium text-gray-900 dark:text-white">{totalStats.rushingYards || 0}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600 dark:text-gray-300">Receiving Yards</span>
          <span className="font-medium text-gray-900 dark:text-white">{totalStats.receivingYards || 0}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600 dark:text-gray-300">Total Touchdowns</span>
          <span className="font-medium text-gray-900 dark:text-white">
            {(totalStats.passingTDs || 0) + (totalStats.rushingTDs || 0) + (totalStats.receivingTDs || 0)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600 dark:text-gray-300">Total Tackles</span>
          <span className="font-medium text-gray-900 dark:text-white">{totalStats.tackles || 0}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600 dark:text-gray-300">Total Sacks</span>
          <span className="font-medium text-gray-900 dark:text-white">{totalStats.sacks || 0}</span>
        </div>
      </div>
    </div>
  );
};

// Player Card Component
const PlayerCard = ({ player }) => {
  const [showDetails, setShowDetails] = useState(false);

  const getPositionColor = (position) => {
    const colors = {
      'QB': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      'RB': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      'WR': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      'TE': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      'OL': 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
      'DL': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      'LB': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      'CB': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
      'S': 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
      'K': 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200',
      'P': 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200'
    };
    return colors[position] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-3">
          <span className="text-sm font-medium text-gray-900 dark:text-white">#{player.jersey}</span>
          <span className="text-sm font-medium text-gray-900 dark:text-white">{player.name}</span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPositionColor(player.position)}`}>
            {player.position}
          </span>
        </div>
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="text-primary-600 hover:text-primary-700 text-sm"
        >
          {showDetails ? 'Hide' : 'Show'} Details
        </button>
      </div>
      
      {showDetails && (
        <div className="mt-3 space-y-2">
          <div className="grid grid-cols-2 gap-2 text-xs">
            {Object.entries(player.seasonStats).map(([stat, value]) => (
              <div key={stat} className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300 capitalize">
                  {stat.replace(/([A-Z])/g, ' $1').trim()}
                </span>
                <span className="font-medium text-gray-900 dark:text-white">{value}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const GameStatsPage = ({ activeLeague }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedGame, setSelectedGame] = useState(null);
  const [allGames, setAllGames] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [activePage, setActivePage] = useState('stats');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Get game from location state or use default
  const gameFromState = location.state?.game;

  useEffect(() => {
    loadAllGames();
    if (gameFromState) {
      setSelectedGame(gameFromState);
      // Save the selected game to localStorage
      localStorage.setItem('selectedGame', JSON.stringify(gameFromState));
    } else {
      // Try to restore the previously selected game from localStorage
      const savedGame = localStorage.getItem('selectedGame');
      if (savedGame) {
        try {
          const parsedGame = JSON.parse(savedGame);
          setSelectedGame(parsedGame);
        } catch (error) {
          console.error('Error parsing saved game:', error);
          localStorage.removeItem('selectedGame');
        }
      }
    }
  }, [gameFromState]); // eslint-disable-line react-hooks/exhaustive-deps

  // Apply dark mode class to document
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);


  const loadAllGames = async () => {
    setLoading(true);
    try {
      console.log('Loading all games...');
      
      const [
        nflGames, 
        ncaaGames, 
        previousNFLGames, 
        previousNCAAGames,
        nextNFLGames,
        nextNCAAGames
      ] = await Promise.all([
        footballApi.getNFLGames(),
        footballApi.getNCAAGames(),
        footballApi.getPreviousWeekNFLGames(),
        footballApi.getPreviousWeekNCAAGames(),
        footballApi.getNextWeekNFLGames(),
        footballApi.getNextWeekNCAAGames()
      ]);
      
      console.log('Games loaded:', {
        nflGames: nflGames.length,
        ncaaGames: ncaaGames.length,
        previousNFLGames: previousNFLGames.length,
        previousNCAAGames: previousNCAAGames.length,
        nextNFLGames: nextNFLGames.length,
        nextNCAAGames: nextNCAAGames.length
      });
      
      // Organize current week games
      const currentWeekCombined = [
        ...nflGames.map(game => ({ ...game, league: 'nfl', weekType: 'current' })),
        ...ncaaGames.map(game => ({ ...game, league: 'ncaa', weekType: 'current' }))
      ];
      
      // Organize previous week games
      const previousWeekCombined = [
        ...previousNFLGames.map(game => ({ ...game, league: 'nfl', weekType: 'previous' })),
        ...previousNCAAGames.map(game => ({ ...game, league: 'ncaa', weekType: 'previous' }))
      ];
      
      // Organize next week games
      const nextWeekCombined = [
        ...nextNFLGames.map(game => ({ ...game, league: 'nfl', weekType: 'next' })),
        ...nextNCAAGames.map(game => ({ ...game, league: 'ncaa', weekType: 'next' }))
      ];
      
      console.log('Combined games:', {
        currentWeek: currentWeekCombined.length,
        previousWeek: previousWeekCombined.length,
        nextWeek: nextWeekCombined.length
      });
      
      // Combine all games
      const allCombinedGames = [...currentWeekCombined, ...previousWeekCombined, ...nextWeekCombined];
              console.log('All combined games:', allCombinedGames);
              console.log('Total games to display:', allCombinedGames.length);
              console.log('NFL games breakdown:', {
                current: nflGames.length,
                previous: previousNFLGames.length,
                next: nextNFLGames.length
              });
              console.log('NCAA games breakdown:', {
                current: ncaaGames.length,
                previous: previousNCAAGames.length,
                next: nextNCAAGames.length
              });
              
              setAllGames(allCombinedGames);
      
      // Set first game as selected if no game from state and no saved game
      if (!gameFromState && allCombinedGames.length > 0) {
        const savedGame = localStorage.getItem('selectedGame');
        if (!savedGame) {
          setSelectedGame(allCombinedGames[0]);
        }
      }
    } catch (error) {
      console.error('Error loading games:', error);
    } finally {
      setLoading(false);
    }
  };

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
    // Don't clear saved game when navigating to team page - we want to return to the same game
    navigate('/team', { state: { team: { name: teamName, league } } });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowSuggestions(false);
      const league = findTeamLeague(searchQuery.trim());
      // Don't clear saved game when navigating to team page - we want to return to the same game
      navigate('/team', { state: { team: { name: searchQuery.trim(), league } } });
    }
  };

  const navigateToHome = () => {
    setActivePage('home');
    // Clear the saved game when navigating away from stats page
    localStorage.removeItem('selectedGame');
    navigate('/');
  };

  const navigateToSchedule = () => {
    setActivePage('schedule');
    navigate('/schedule');
  };

  const handleGameSelect = (game) => {
    setSelectedGame(game);
    // Save the selected game to localStorage
    localStorage.setItem('selectedGame', JSON.stringify(game));
  };


  const getLeagueColor = (league) => {
    return league === 'nfl' ? 'bg-blue-500' : 'bg-red-500';
  };

  const getLeagueText = (league) => {
    return league === 'nfl' ? 'NFL' : 'NCAA';
  };

  // Function to filter games by search term
  const filterGamesBySearch = (games) => {
    if (!searchTerm.trim()) {
      return games;
    }
    
    const searchLower = searchTerm.toLowerCase();
    return games.filter(game => 
      game.awayTeam.toLowerCase().includes(searchLower) || 
      game.homeTeam.toLowerCase().includes(searchLower)
    );
  };

  // Function to handle NCAA search - searches by home team and finds unloaded games
  const handleNCAASearch = async (searchTerm) => {
    console.log('NCAA search called with:', searchTerm);
    
    if (!searchTerm.trim() || activeLeague !== 'ncaa') {
      setSearchResults([]);
      return;
    }

    try {
      setLoading(true);
      const searchLower = searchTerm.toLowerCase();
      
      // First, search existing loaded games
      const allNCAAGames = allGames.filter(game => game.league === 'ncaa');
      const existingResults = allNCAAGames.filter(game => {
        const homeTeam = game.homeTeam.toLowerCase();
        return homeTeam.includes(searchLower);
      });
      
      console.log('Found', existingResults.length, 'matching games in loaded data');
      
      // If we found results in existing games, use those
      if (existingResults.length > 0) {
        setSearchResults(existingResults.slice(0, 5));
        setLoading(false);
        return;
      }
      
      // If no results in existing games, search the API for unloaded games
      console.log('No existing results, searching API for unloaded games...');
      
      try {
        // Search current week games from API
        const apiGames = await footballApi.getNCAAGames();
        console.log('API games fetched:', apiGames.length);
        console.log('Sample API games:', apiGames.slice(0, 3).map(g => `${g.awayTeam} vs ${g.homeTeam}`));
        
        // Filter games that match the search term (home team only)
        const apiResults = apiGames.filter(game => {
          const homeTeam = game.homeTeam.toLowerCase();
          const awayTeam = game.awayTeam.toLowerCase();
          
          // Check both home and away teams for better matching
          const homeMatch = homeTeam.includes(searchLower);
          const awayMatch = awayTeam.includes(searchLower);
          
          if (homeMatch || awayMatch) {
            console.log('Found API match:', game.awayTeam, 'vs', game.homeTeam, '(home match:', homeMatch, ', away match:', awayMatch, ')');
          }
          return homeMatch || awayMatch;
        });
        
        console.log('API matching games found:', apiResults.length);
        
        // If still no results, try searching previous and next week
        if (apiResults.length === 0) {
          console.log('No current week results, searching previous and next week...');
          
          const [prevGames, nextGames] = await Promise.all([
            footballApi.getPreviousWeekNCAAGames().catch(() => []),
            footballApi.getNextWeekNCAAGames().catch(() => [])
          ]);
          
          const allWeekGames = [...prevGames, ...nextGames];
          console.log('Additional weeks games:', allWeekGames.length);
          
          const additionalResults = allWeekGames.filter(game => {
            const homeTeam = game.homeTeam.toLowerCase();
            const awayTeam = game.awayTeam.toLowerCase();
            const homeMatch = homeTeam.includes(searchLower);
            const awayMatch = awayTeam.includes(searchLower);
            
            if (homeMatch || awayMatch) {
              console.log('Found additional week match:', game.awayTeam, 'vs', game.homeTeam);
            }
            return homeMatch || awayMatch;
          });
          
          console.log('Additional week matches found:', additionalResults.length);
          setSearchResults(additionalResults.slice(0, 5));
        } else {
          setSearchResults(apiResults.slice(0, 5));
        }
        
      } catch (apiError) {
        console.log('API search failed:', apiError);
        setSearchResults([]);
      }
      
    } catch (error) {
      console.error('Error in NCAA search:', error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  // Function to get biggest/most important games
  const getBiggestGames = (games, maxGames = 8) => {
    // For NFL, show all games (they're all important)
    if (activeLeague === 'nfl') {
      return games;
    }
    
    // For NCAA, prioritize games with ranked teams or major conferences
    const majorTeams = [
      'alabama', 'georgia', 'michigan', 'ohio state', 'texas', 'oklahoma', 'oregon', 'washington',
      'florida state', 'clemson', 'penn state', 'notre dame', 'usc', 'ucla', 'lsu', 'tennessee',
      'auburn', 'florida', 'miami', 'virginia tech', 'north carolina', 'duke', 'stanford', 'california',
      'wisconsin', 'iowa', 'nebraska', 'minnesota', 'baylor', 'oklahoma state', 'kansas state',
      'tcu', 'houston', 'cincinnati', 'utah', 'colorado', 'arizona', 'arizona state'
    ];
    
    const biggestGames = games.filter(game => {
      const awayTeam = game.awayTeam.toLowerCase();
      const homeTeam = game.homeTeam.toLowerCase();
      return majorTeams.some(team => awayTeam.includes(team) || homeTeam.includes(team));
    });
    
    // If we have fewer than maxGames of major games, fill with remaining games
    if (biggestGames.length < maxGames) {
      const remainingGames = games.filter(game => !biggestGames.includes(game));
      return [...biggestGames, ...remainingGames.slice(0, maxGames - biggestGames.length)];
    }
    
    return biggestGames.slice(0, maxGames);
  };

  // Mock detailed stats data
  const getDetailedStats = (game) => {
    if (!game) return null;
    
    // If game is scheduled (not started yet), return all zeros
    if (game.status === 'Scheduled' || game.status === 'Pre-Game') {
      return {
        homeTeam: {
          name: game.homeTeam,
          score: 0,
          stats: {
            totalYards: 0,
            passingYards: 0,
            rushingYards: 0,
            turnovers: 0,
            timeOfPossession: '00:00',
            firstDowns: 0,
            penalties: 0,
            penaltyYards: 0
          }
        },
        awayTeam: {
          name: game.awayTeam,
          score: 0,
          stats: {
            totalYards: 0,
            passingYards: 0,
            rushingYards: 0,
            turnovers: 0,
            timeOfPossession: '00:00',
            firstDowns: 0,
            penalties: 0,
            penaltyYards: 0
          }
        }
      };
    }
    
    // For live or final games, return mock stats
    return {
      homeTeam: {
        name: game.homeTeam,
        score: game.homeScore,
        stats: {
          totalYards: Math.floor(Math.random() * 200) + 300,
          passingYards: Math.floor(Math.random() * 150) + 200,
          rushingYards: Math.floor(Math.random() * 100) + 50,
          turnovers: Math.floor(Math.random() * 3),
          timeOfPossession: `${Math.floor(Math.random() * 10) + 25}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`,
          firstDowns: Math.floor(Math.random() * 10) + 15,
          penalties: Math.floor(Math.random() * 8) + 2,
          penaltyYards: Math.floor(Math.random() * 50) + 20
        }
      },
      awayTeam: {
        name: game.awayTeam,
        score: game.awayScore,
        stats: {
          totalYards: Math.floor(Math.random() * 200) + 300,
          passingYards: Math.floor(Math.random() * 150) + 200,
          rushingYards: Math.floor(Math.random() * 100) + 50,
          turnovers: Math.floor(Math.random() * 3),
          timeOfPossession: `${Math.floor(Math.random() * 10) + 25}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`,
          firstDowns: Math.floor(Math.random() * 10) + 15,
          penalties: Math.floor(Math.random() * 8) + 2,
          penaltyYards: Math.floor(Math.random() * 50) + 20
        }
      }
    };
  };

  const detailedStats = getDetailedStats(selectedGame);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Navigation Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-10 h-10 bg-primary-600 rounded-lg">
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-black dark:text-white">Game Statistics</h1>
                <p className="text-sm text-gray-700 dark:text-gray-300">Detailed game analysis</p>
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
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-64px)]">
        {/* Left Sidebar - Games List */}
        <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
          <div className="p-3">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-semibold text-gray-900 dark:text-white">All Games</h2>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {(() => {
                  const filteredGames = filterGamesBySearch(allGames.filter(game => game.league === activeLeague));
                  const displayedGames = getBiggestGames(filteredGames);
                  return searchTerm ? `${displayedGames.length} of ${filteredGames.length} games` : `${displayedGames.length} games`;
                })()}
              </div>
            </div>
            

            {/* Search Bar */}
            <div className="mb-3">
              <div className="relative">
                <input
                  type="text"
                  placeholder={activeLeague === 'ncaa' ? 'Search by team name...' : `Search ${activeLeague.toUpperCase()} games...`}
                  value={searchTerm}
                  onChange={(e) => {
                    const value = e.target.value;
                    console.log('Search input changed:', value, 'activeLeague:', activeLeague);
                    setSearchTerm(value);
                    if (activeLeague === 'ncaa') {
                      handleNCAASearch(value);
                    }
                  }}
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                {searchTerm && (
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setSearchResults([]);
                    }}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    ✕
                  </button>
                )}
              </div>
              {/* Test button for debugging */}
              {activeLeague === 'ncaa' && (
                <button
                  onClick={() => {
                    console.log('Test search clicked');
                    handleNCAASearch('alabama');
                  }}
                  className="mt-2 text-xs bg-blue-500 text-white px-2 py-1 rounded"
                >
                  Test Search "alabama"
                </button>
              )}
            </div>

            {/* Search Results for NCAA */}
            {activeLeague === 'ncaa' && searchTerm && (
              <div className="mb-3">
                <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                  Search Results {loading && <span className="text-blue-500">(Searching...)</span>}
                </div>
                {searchResults.length > 0 ? (
                  <div className="space-y-1">
                    {searchResults.map((game) => (
                      <div
                        key={`search-${game.id}`}
                        onClick={() => handleGameSelect(game)}
                        className="p-2 rounded-md border cursor-pointer transition-all bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/30 border-blue-200 dark:border-blue-700"
                      >
                        <div className="text-xs font-medium text-gray-900 dark:text-white">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate('/team', { state: { team: { name: game.awayTeam, league: game.league } } });
                            }}
                            className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                          >
                            {game.awayTeam}
                          </button>
                          {' @ '}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate('/team', { state: { team: { name: game.homeTeam, league: game.league } } });
                            }}
                            className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                          >
                            {game.homeTeam}
                          </button>
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {game.status} • {game.week}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : !loading ? (
                  <div className="text-xs text-gray-500 dark:text-gray-400 p-2">
                    No games found for "{searchTerm}"
                  </div>
                ) : null}
              </div>
            )}

            {/* Title for Most Recent Games */}
            {activeLeague === 'ncaa' && !searchTerm && (
              <div className="mb-3">
                <div className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  Most Recent Games Listed
                </div>
              </div>
            )}

            {/* Games List */}
            <div className="space-y-4">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
                </div>
              ) : (
                <>
                          {/* Current Week Games */}
                          {(() => {
                            const currentWeekGames = allGames.filter(game => game.league === activeLeague && game.weekType === 'current');
                            const filteredGames = filterGamesBySearch(currentWeekGames);
                            const displayedGames = getBiggestGames(filteredGames);
                            console.log(`Current week ${activeLeague} games:`, displayedGames);
                            return displayedGames.length > 0;
                          })() && (
                            <div>
                              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                Current Week {(() => {
                                  const currentWeekGames = allGames.filter(game => game.league === activeLeague && game.weekType === 'current');
                                  const filteredGames = filterGamesBySearch(currentWeekGames);
                                  const displayedGames = getBiggestGames(filteredGames);
                                  return displayedGames.length > 0 ? `(${displayedGames[0].week}) - ${displayedGames.length} games` : '';
                                })()}
                              </h3>
                              <div className="space-y-2">
                                {(() => {
                                  const currentWeekGames = allGames.filter(game => game.league === activeLeague && game.weekType === 'current');
                                  const filteredGames = filterGamesBySearch(currentWeekGames);
                                  return getBiggestGames(filteredGames);
                                })().map((game) => (
                            <div
                              key={game.id}
                              onClick={() => handleGameSelect(game)}
                              className={`p-2 rounded-md border cursor-pointer transition-all ${
                                selectedGame?.id === game.id
                                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                                  : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                              }`}
                            >
                              <div className="flex items-center justify-between mb-1">
                                <div className="flex items-center space-x-1">
                                  <div className={`w-1.5 h-1.5 rounded-full ${getLeagueColor(game.league)}`}></div>
                                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                    {game.week}
                                  </span>
                                </div>
                                <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400">
                                  <Clock className="w-2.5 h-2.5" />
                                  <span className="text-xs">{game.time}</span>
                                </div>
                              </div>
                              
                              <div className="space-y-0.5">
                                <div className="flex items-center justify-between">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      navigate('/team', { state: { team: { name: game.awayTeam, league: game.league } } });
                                    }}
                                    className="text-xs font-medium text-gray-900 dark:text-white truncate hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                                  >
                                    {game.awayTeam.split(' ').slice(-1)[0]}
                                  </button>
                                  <span className="text-xs font-bold text-gray-900 dark:text-white">
                                    {game.awayScore}
                                  </span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      navigate('/team', { state: { team: { name: game.homeTeam, league: game.league } } });
                                    }}
                                    className="text-xs font-medium text-gray-900 dark:text-white truncate hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                                  >
                                    {game.homeTeam.split(' ').slice(-1)[0]}
                                  </button>
                                  <span className="text-xs font-bold text-gray-900 dark:text-white">
                                    {game.homeScore}
                                  </span>
                                </div>
                              </div>
                              
                              <div className="mt-1 flex items-center justify-between">
                                <span className={`px-1.5 py-0.5 rounded-full text-xs font-medium ${
                                  game.status === 'Final'
                                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                    : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                }`}>
                                  {game.status}
                                </span>
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  {game.date}
                                </span>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* Previous Week Final Games */}
                  {(() => {
                    const previousWeekGames = allGames.filter(game => game.league === activeLeague && game.weekType === 'previous');
                    const filteredGames = filterGamesBySearch(previousWeekGames);
                    const displayedGames = getBiggestGames(filteredGames);
                    console.log(`Previous week ${activeLeague} games:`, displayedGames);
                    return displayedGames.length > 0;
                  })() && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Previous Week {(() => {
                          const previousWeekGames = allGames.filter(game => game.league === activeLeague && game.weekType === 'previous');
                          const filteredGames = filterGamesBySearch(previousWeekGames);
                          const displayedGames = getBiggestGames(filteredGames);
                          console.log('Previous week games for display:', displayedGames);
                          if (displayedGames.length > 0) {
                            console.log('First previous week game:', displayedGames[0]);
                            console.log('Week number from game:', displayedGames[0].week);
                          }
                          return displayedGames.length > 0 ? `(${displayedGames[0].week}) - ${displayedGames.length} games` : '';
                        })()}
                      </h3>
                      <div className="space-y-2">
                        {(() => {
                          const previousWeekGames = allGames.filter(game => game.league === activeLeague && game.weekType === 'previous');
                          const filteredGames = filterGamesBySearch(previousWeekGames);
                          return getBiggestGames(filteredGames);
                        })().map((game) => (
                            <div
                              key={`prev-${game.id}`}
                              onClick={() => handleGameSelect(game)}
                              className={`p-2 rounded-md border cursor-pointer transition-all ${
                                selectedGame?.id === game.id
                                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                                  : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                              }`}
                            >
                              <div className="flex items-center justify-between mb-1">
                                <div className="flex items-center space-x-1">
                                  <div className={`w-1.5 h-1.5 rounded-full ${getLeagueColor(game.league)}`}></div>
                                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                    {game.week}
                                  </span>
                                </div>
                                <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400">
                                  <Clock className="w-2.5 h-2.5" />
                                  <span className="text-xs">{game.time}</span>
                                </div>
                              </div>
                              
                              <div className="space-y-0.5">
                                <div className="flex items-center justify-between">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      navigate('/team', { state: { team: { name: game.awayTeam, league: game.league } } });
                                    }}
                                    className="text-xs font-medium text-gray-900 dark:text-white truncate hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                                  >
                                    {game.awayTeam.split(' ').slice(-1)[0]}
                                  </button>
                                  <span className="text-xs font-bold text-gray-900 dark:text-white">
                                    {game.awayScore}
                                  </span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      navigate('/team', { state: { team: { name: game.homeTeam, league: game.league } } });
                                    }}
                                    className="text-xs font-medium text-gray-900 dark:text-white truncate hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                                  >
                                    {game.homeTeam.split(' ').slice(-1)[0]}
                                  </button>
                                  <span className="text-xs font-bold text-gray-900 dark:text-white">
                                    {game.homeScore}
                                  </span>
                                </div>
                              </div>
                              
                              <div className="mt-1 flex items-center justify-between">
                                <span className={`px-1.5 py-0.5 rounded-full text-xs font-medium ${
                                  game.status === 'Final'
                                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                    : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                }`}>
                                  {game.status}
                                </span>
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  {game.date}
                                </span>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* Next Week Games */}
                  {(() => {
                    const nextWeekGames = allGames.filter(game => game.league === activeLeague && game.weekType === 'next');
                    const filteredGames = filterGamesBySearch(nextWeekGames);
                    const displayedGames = getBiggestGames(filteredGames);
                    console.log(`Next week ${activeLeague} games:`, displayedGames);
                    return displayedGames.length > 0;
                  })() && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Next Week {(() => {
                          const nextWeekGames = allGames.filter(game => game.league === activeLeague && game.weekType === 'next');
                          const filteredGames = filterGamesBySearch(nextWeekGames);
                          const displayedGames = getBiggestGames(filteredGames);
                          return displayedGames.length > 0 ? `(${displayedGames[0].week}) - ${displayedGames.length} games` : '';
                        })()}
                      </h3>
                      <div className="space-y-2">
                        {(() => {
                          const nextWeekGames = allGames.filter(game => game.league === activeLeague && game.weekType === 'next');
                          const filteredGames = filterGamesBySearch(nextWeekGames);
                          return getBiggestGames(filteredGames);
                        })().map((game) => (
                            <div
                              key={`next-${game.id}`}
                              onClick={() => handleGameSelect(game)}
                              className={`p-2 rounded-md border cursor-pointer transition-all ${
                                selectedGame?.id === game.id
                                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                                  : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                              }`}
                            >
                              <div className="flex items-center justify-between mb-1">
                                <div className="flex items-center space-x-1">
                                  <div className={`w-1.5 h-1.5 rounded-full ${getLeagueColor(game.league)}`}></div>
                                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                    {game.week}
                                  </span>
                                </div>
                                <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400">
                                  <Clock className="w-2.5 h-2.5" />
                                  <span className="text-xs">{game.time}</span>
                                </div>
                              </div>
                              
                              <div className="space-y-0.5">
                                <div className="flex items-center justify-between">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      navigate('/team', { state: { team: { name: game.awayTeam, league: game.league } } });
                                    }}
                                    className="text-xs font-medium text-gray-900 dark:text-white truncate hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                                  >
                                    {game.awayTeam.split(' ').slice(-1)[0]}
                                  </button>
                                  <span className="text-xs font-bold text-gray-900 dark:text-white">
                                    {game.awayScore}
                                  </span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      navigate('/team', { state: { team: { name: game.homeTeam, league: game.league } } });
                                    }}
                                    className="text-xs font-medium text-gray-900 dark:text-white truncate hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                                  >
                                    {game.homeTeam.split(' ').slice(-1)[0]}
                                  </button>
                                  <span className="text-xs font-bold text-gray-900 dark:text-white">
                                    {game.homeScore}
                                  </span>
                                </div>
                              </div>
                              
                              <div className="mt-1 flex items-center justify-between">
                                <span className={`px-1.5 py-0.5 rounded-full text-xs font-medium ${
                                  game.status === 'Final'
                                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                    : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                                }`}>
                                  {game.status}
                                </span>
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  {game.date}
                                </span>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* No Games Message */}
                  {(() => {
                    const leagueGames = allGames.filter(game => game.league === activeLeague);
                    const filteredGames = filterGamesBySearch(leagueGames);
                    const displayedGames = getBiggestGames(filteredGames);
                    return displayedGames.length === 0;
                  })() && (
                    <div className="text-center py-8">
                      <BarChart3 className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        No {activeLeague.toUpperCase()} games available
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col">
          {selectedGame && detailedStats ? (
            <>
                      {/* Game Header */}
                      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                              <button
                                onClick={() => navigate('/team', { state: { team: { name: selectedGame.awayTeam, league: selectedGame.league } } })}
                                className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                              >
                                {selectedGame.awayTeam}
                              </button>
                              {' vs '}
                              <button
                                onClick={() => navigate('/team', { state: { team: { name: selectedGame.homeTeam, league: selectedGame.league } } })}
                                className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                              >
                                {selectedGame.homeTeam}
                              </button>
                            </h2>
                            <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-300">
                              <span>{selectedGame.week}</span>
                              <span>•</span>
                              <span>{selectedGame.date}</span>
                              <span>•</span>
                              <span>{selectedGame.time}</span>
                              <span>•</span>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                selectedGame.status === 'Final'
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                  : selectedGame.status === 'Scheduled' || selectedGame.status === 'Pre-Game'
                                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                                  : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                              }`}>
                                {selectedGame.status}
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-3xl font-bold text-gray-900 dark:text-white">
                              {selectedGame.status === 'Scheduled' || selectedGame.status === 'Pre-Game' 
                                ? '0 - 0' 
                                : `${selectedGame.awayScore} - ${selectedGame.homeScore}`
                              }
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-300">
                              {getLeagueText(selectedGame.league)}
                            </div>
                          </div>
                        </div>
                      </div>

              {/* Stats Content */}
              <div className="flex-1 p-6 overflow-y-auto">
                {/* Scheduled Game Notice */}
                {(selectedGame.status === 'Scheduled' || selectedGame.status === 'Pre-Game') && (
                  <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      <p className="text-blue-800 dark:text-blue-200 font-medium">
                        This game is scheduled and hasn't started yet. Game statistics will be available once the game begins.
                      </p>
                    </div>
                  </div>
                )}

                {/* Game Statistics Section */}
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                    <BarChart3 className="w-6 h-6 mr-3 text-primary-600" />
                    Game Statistics
                  </h2>
                  
                  {/* Compact Game Stats */}
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-6">
                  <div className="grid grid-cols-2 gap-8">
                    {/* Away Team Stats */}
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                          {detailedStats.awayTeam.name}
                        </h3>
                        <div className="text-xl font-bold text-primary-600">
                          {detailedStats.awayTeam.score}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-300">Total Yards</span>
                          <span className="font-medium text-gray-900 dark:text-white">{detailedStats.awayTeam.stats.totalYards}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-300">Passing</span>
                          <span className="font-medium text-gray-900 dark:text-white">{detailedStats.awayTeam.stats.passingYards}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-300">Rushing</span>
                          <span className="font-medium text-gray-900 dark:text-white">{detailedStats.awayTeam.stats.rushingYards}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-300">Turnovers</span>
                          <span className="font-medium text-gray-900 dark:text-white">{detailedStats.awayTeam.stats.turnovers}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-300">First Downs</span>
                          <span className="font-medium text-gray-900 dark:text-white">{detailedStats.awayTeam.stats.firstDowns}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-300">Time of Poss</span>
                          <span className="font-medium text-gray-900 dark:text-white">{detailedStats.awayTeam.stats.timeOfPossession}</span>
                        </div>
                        <div className="flex justify-between col-span-2">
                          <span className="text-gray-600 dark:text-gray-300">Penalties</span>
                          <span className="font-medium text-gray-900 dark:text-white">{detailedStats.awayTeam.stats.penalties} ({detailedStats.awayTeam.stats.penaltyYards} yds)</span>
                        </div>
                      </div>
                    </div>

                    {/* Home Team Stats */}
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                          {detailedStats.homeTeam.name}
                        </h3>
                        <div className="text-xl font-bold text-primary-600">
                          {detailedStats.homeTeam.score}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-300">Total Yards</span>
                          <span className="font-medium text-gray-900 dark:text-white">{detailedStats.homeTeam.stats.totalYards}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-300">Passing</span>
                          <span className="font-medium text-gray-900 dark:text-white">{detailedStats.homeTeam.stats.passingYards}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-300">Rushing</span>
                          <span className="font-medium text-gray-900 dark:text-white">{detailedStats.homeTeam.stats.rushingYards}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-300">Turnovers</span>
                          <span className="font-medium text-gray-900 dark:text-white">{detailedStats.homeTeam.stats.turnovers}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-300">First Downs</span>
                          <span className="font-medium text-gray-900 dark:text-white">{detailedStats.homeTeam.stats.firstDowns}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-300">Time of Poss</span>
                          <span className="font-medium text-gray-900 dark:text-white">{detailedStats.homeTeam.stats.timeOfPossession}</span>
                        </div>
                        <div className="flex justify-between col-span-2">
                          <span className="text-gray-600 dark:text-gray-300">Penalties</span>
                          <span className="font-medium text-gray-900 dark:text-white">{detailedStats.homeTeam.stats.penalties} ({detailedStats.homeTeam.stats.penaltyYards} yds)</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Team Rosters */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Away Team Roster */}
                  <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                      {detailedStats.awayTeam.name} Roster
                    </h3>
                    
                    <div className="space-y-3">
                      {/* Offense */}
                      <div>
                        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Offense</h4>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-300">QB - John Smith</span>
                            <span className="text-gray-900 dark:text-white">
                              {(selectedGame.status === 'Scheduled' || selectedGame.status === 'Pre-Game') 
                                ? '0/0, 0 yds, 0 TD' 
                                : '24/38, 287 yds, 2 TD'
                              }
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-300">RB - Mike Johnson</span>
                            <span className="text-gray-900 dark:text-white">
                              {(selectedGame.status === 'Scheduled' || selectedGame.status === 'Pre-Game') 
                                ? '0 car, 0 yds, 0 TD' 
                                : '18 car, 95 yds, 1 TD'
                              }
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-300">WR - Chris Davis</span>
                            <span className="text-gray-900 dark:text-white">
                              {(selectedGame.status === 'Scheduled' || selectedGame.status === 'Pre-Game') 
                                ? '0 rec, 0 yds, 0 TD' 
                                : '8 rec, 124 yds, 1 TD'
                              }
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-300">TE - Alex Wilson</span>
                            <span className="text-gray-900 dark:text-white">
                              {(selectedGame.status === 'Scheduled' || selectedGame.status === 'Pre-Game') 
                                ? '0 rec, 0 yds' 
                                : '5 rec, 67 yds'
                              }
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Defense */}
                      <div>
                        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Defense</h4>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-300">LB - Tom Brown</span>
                            <span className="text-gray-900 dark:text-white">
                              {(selectedGame.status === 'Scheduled' || selectedGame.status === 'Pre-Game') 
                                ? '0 tackles, 0 sacks' 
                                : '12 tackles, 1 sack'
                              }
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-300">CB - Sam Green</span>
                            <span className="text-gray-900 dark:text-white">
                              {(selectedGame.status === 'Scheduled' || selectedGame.status === 'Pre-Game') 
                                ? '0 tackles, 0 INT' 
                                : '8 tackles, 1 INT'
                              }
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-300">DE - Rob White</span>
                            <span className="text-gray-900 dark:text-white">
                              {(selectedGame.status === 'Scheduled' || selectedGame.status === 'Pre-Game') 
                                ? '0 tackles, 0 sacks' 
                                : '6 tackles, 2 sacks'
                              }
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Home Team Roster */}
                  <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                      {detailedStats.homeTeam.name} Roster
                    </h3>
                    
                    <div className="space-y-3">
                      {/* Offense */}
                      <div>
                        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Offense</h4>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-300">QB - David Lee</span>
                            <span className="text-gray-900 dark:text-white">
                              {(selectedGame.status === 'Scheduled' || selectedGame.status === 'Pre-Game') 
                                ? '0/0, 0 yds, 0 TD' 
                                : '19/32, 245 yds, 1 TD'
                              }
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-300">RB - James Taylor</span>
                            <span className="text-gray-900 dark:text-white">
                              {(selectedGame.status === 'Scheduled' || selectedGame.status === 'Pre-Game') 
                                ? '0 car, 0 yds, 0 TD' 
                                : '22 car, 112 yds, 2 TD'
                              }
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-300">WR - Mark Anderson</span>
                            <span className="text-gray-900 dark:text-white">
                              {(selectedGame.status === 'Scheduled' || selectedGame.status === 'Pre-Game') 
                                ? '0 rec, 0 yds' 
                                : '6 rec, 89 yds'
                              }
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-300">TE - Steve Clark</span>
                            <span className="text-gray-900 dark:text-white">
                              {(selectedGame.status === 'Scheduled' || selectedGame.status === 'Pre-Game') 
                                ? '0 rec, 0 yds, 0 TD' 
                                : '4 rec, 56 yds, 1 TD'
                              }
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Defense */}
                      <div>
                        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Defense</h4>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-300">LB - Kevin Moore</span>
                            <span className="text-gray-900 dark:text-white">
                              {(selectedGame.status === 'Scheduled' || selectedGame.status === 'Pre-Game') 
                                ? '0 tackles, 0 sacks' 
                                : '10 tackles, 1 sack'
                              }
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-300">CB - Ryan King</span>
                            <span className="text-gray-900 dark:text-white">
                              {(selectedGame.status === 'Scheduled' || selectedGame.status === 'Pre-Game') 
                                ? '0 tackles, 0 INT' 
                                : '7 tackles, 2 INT'
                              }
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-300">DE - Paul Miller</span>
                            <span className="text-gray-900 dark:text-white">
                              {(selectedGame.status === 'Scheduled' || selectedGame.status === 'Pre-Game') 
                                ? '0 tackles, 0 sacks' 
                                : '5 tackles, 1 sack'
                              }
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                </div>

                {/* All Statistics Section */}
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                    <Trophy className="w-6 h-6 mr-3 text-primary-600" />
                    All Statistics
                  </h2>
                  
                  <AllStatisticsSection selectedGame={selectedGame} />
                </div>
              </div>

              {/* Chat Box */}
              <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <MessageCircle className="w-5 h-5 text-primary-600" />
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white">AI Chat</h4>
                  <span className="text-xs bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200 px-2 py-1 rounded-full">
                    Cedar Framework Coming Soon
                  </span>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 min-h-[120px] flex items-center justify-center">
                  <div className="text-center">
                    <MessageCircle className="w-8 h-8 text-gray-400 dark:text-gray-500 mx-auto mb-2" />
                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                      AI-powered chat interface will be integrated here using the Cedar framework
                    </p>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <BarChart3 className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-300 mb-2">
                  Select a Game
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Choose a game from the sidebar to view detailed statistics
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GameStatsPage;
