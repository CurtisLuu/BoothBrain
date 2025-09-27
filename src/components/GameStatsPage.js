import React, { useState, useEffect } from 'react';
import { ArrowLeft, Trophy, BarChart3, MessageCircle, Clock } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import footballApi from '../services/footballApi';

const GameStatsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedGame, setSelectedGame] = useState(null);
  const [allGames, setAllGames] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeLeague, setActiveLeague] = useState('nfl');

  // Get game from location state or use default
  const gameFromState = location.state?.game;

  useEffect(() => {
    loadAllGames();
    if (gameFromState) {
      setSelectedGame(gameFromState);
      setActiveLeague(gameFromState.league);
    }
  }, [gameFromState]); // eslint-disable-line react-hooks/exhaustive-deps


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
      
      setAllGames(allCombinedGames);
      
      // Set first game as selected if no game from state
      if (!gameFromState && allCombinedGames.length > 0) {
        setSelectedGame(allCombinedGames[0]);
        setActiveLeague(allCombinedGames[0].league);
      }
    } catch (error) {
      console.error('Error loading games:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGameSelect = (game) => {
    setSelectedGame(game);
    setActiveLeague(game.league);
  };

  const getLeagueColor = (league) => {
    return league === 'nfl' ? 'bg-blue-500' : 'bg-red-500';
  };

  const getLeagueText = (league) => {
    return league === 'nfl' ? 'NFL' : 'NCAA';
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
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/')}
                className="flex items-center space-x-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Games</span>
              </button>
              <div className="h-6 w-px bg-gray-300 dark:bg-gray-600"></div>
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-10 h-10 bg-primary-600 rounded-lg">
                  <Trophy className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-black dark:text-white">Game Statistics</h1>
                  <p className="text-sm text-gray-700 dark:text-gray-300">Detailed game analysis</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-64px)]">
        {/* Left Sidebar - Games List */}
        <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
          <div className="p-3">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-3">All Games</h2>
            
            {/* League Filter */}
            <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1 mb-3">
              <button
                onClick={() => setActiveLeague('nfl')}
                className={`flex-1 py-1.5 px-2 text-xs font-medium rounded-md transition-colors ${
                  activeLeague === 'nfl'
                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                NFL
              </button>
              <button
                onClick={() => setActiveLeague('ncaa')}
                className={`flex-1 py-1.5 px-2 text-xs font-medium rounded-md transition-colors ${
                  activeLeague === 'ncaa'
                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                NCAA
              </button>
            </div>

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
                    console.log(`Current week ${activeLeague} games:`, currentWeekGames);
                    return currentWeekGames.length > 0;
                  })() && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Current Week {(() => {
                          const currentWeekGames = allGames.filter(game => game.league === activeLeague && game.weekType === 'current');
                          return currentWeekGames.length > 0 ? `(${currentWeekGames[0].week})` : '';
                        })()}
                      </h3>
                      <div className="space-y-2">
                        {allGames
                          .filter(game => game.league === activeLeague && game.weekType === 'current')
                          .map((game) => (
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
                                  <span className="text-xs font-medium text-gray-900 dark:text-white truncate">
                                    {game.awayTeam.split(' ').slice(-1)[0]}
                                  </span>
                                  <span className="text-xs font-bold text-gray-900 dark:text-white">
                                    {game.awayScore}
                                  </span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-medium text-gray-900 dark:text-white truncate">
                                    {game.homeTeam.split(' ').slice(-1)[0]}
                                  </span>
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
                    console.log(`Previous week ${activeLeague} games:`, previousWeekGames);
                    return previousWeekGames.length > 0;
                  })() && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Previous Week {(() => {
                          const previousWeekGames = allGames.filter(game => game.league === activeLeague && game.weekType === 'previous');
                          console.log('Previous week games for display:', previousWeekGames);
                          if (previousWeekGames.length > 0) {
                            console.log('First previous week game:', previousWeekGames[0]);
                            console.log('Week number from game:', previousWeekGames[0].week);
                          }
                          return previousWeekGames.length > 0 ? `(${previousWeekGames[0].week})` : '';
                        })()}
                      </h3>
                      <div className="space-y-2">
                        {allGames
                          .filter(game => game.league === activeLeague && game.weekType === 'previous')
                          .map((game) => (
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
                                  <span className="text-xs font-medium text-gray-900 dark:text-white truncate">
                                    {game.awayTeam.split(' ').slice(-1)[0]}
                                  </span>
                                  <span className="text-xs font-bold text-gray-900 dark:text-white">
                                    {game.awayScore}
                                  </span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-medium text-gray-900 dark:text-white truncate">
                                    {game.homeTeam.split(' ').slice(-1)[0]}
                                  </span>
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
                    console.log(`Next week ${activeLeague} games:`, nextWeekGames);
                    return nextWeekGames.length > 0;
                  })() && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Next Week {(() => {
                          const nextWeekGames = allGames.filter(game => game.league === activeLeague && game.weekType === 'next');
                          return nextWeekGames.length > 0 ? `(${nextWeekGames[0].week})` : '';
                        })()}
                      </h3>
                      <div className="space-y-2">
                        {allGames
                          .filter(game => game.league === activeLeague && game.weekType === 'next')
                          .map((game) => (
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
                                  <span className="text-xs font-medium text-gray-900 dark:text-white truncate">
                                    {game.awayTeam.split(' ').slice(-1)[0]}
                                  </span>
                                  <span className="text-xs font-bold text-gray-900 dark:text-white">
                                    {game.awayScore}
                                  </span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-medium text-gray-900 dark:text-white truncate">
                                    {game.homeTeam.split(' ').slice(-1)[0]}
                                  </span>
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
                  {allGames.filter(game => game.league === activeLeague).length === 0 && (
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
                              {selectedGame.awayTeam} vs {selectedGame.homeTeam}
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
                        This game is scheduled and hasn't started yet. All statistics will be available once the game begins.
                      </p>
                    </div>
                  </div>
                )}
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Away Team Stats */}
                  <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                        {detailedStats.awayTeam.name}
                      </h3>
                      <div className="text-2xl font-bold text-primary-600">
                        {detailedStats.awayTeam.score}
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                          <div className="text-2xl font-bold text-gray-900 dark:text-white">
                            {detailedStats.awayTeam.stats.totalYards}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-300">Total Yards</div>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                          <div className="text-2xl font-bold text-gray-900 dark:text-white">
                            {detailedStats.awayTeam.stats.passingYards}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-300">Passing Yards</div>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                          <div className="text-2xl font-bold text-gray-900 dark:text-white">
                            {detailedStats.awayTeam.stats.rushingYards}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-300">Rushing Yards</div>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                          <div className="text-2xl font-bold text-gray-900 dark:text-white">
                            {detailedStats.awayTeam.stats.turnovers}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-300">Turnovers</div>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-600">
                          <span className="text-gray-600 dark:text-gray-300">Time of Possession</span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {detailedStats.awayTeam.stats.timeOfPossession}
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-600">
                          <span className="text-gray-600 dark:text-gray-300">First Downs</span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {detailedStats.awayTeam.stats.firstDowns}
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-600">
                          <span className="text-gray-600 dark:text-gray-300">Penalties</span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {detailedStats.awayTeam.stats.penalties} ({detailedStats.awayTeam.stats.penaltyYards} yds)
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Home Team Stats */}
                  <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                        {detailedStats.homeTeam.name}
                      </h3>
                      <div className="text-2xl font-bold text-primary-600">
                        {detailedStats.homeTeam.score}
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                          <div className="text-2xl font-bold text-gray-900 dark:text-white">
                            {detailedStats.homeTeam.stats.totalYards}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-300">Total Yards</div>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                          <div className="text-2xl font-bold text-gray-900 dark:text-white">
                            {detailedStats.homeTeam.stats.passingYards}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-300">Passing Yards</div>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                          <div className="text-2xl font-bold text-gray-900 dark:text-white">
                            {detailedStats.homeTeam.stats.rushingYards}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-300">Rushing Yards</div>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                          <div className="text-2xl font-bold text-gray-900 dark:text-white">
                            {detailedStats.homeTeam.stats.turnovers}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-300">Turnovers</div>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-600">
                          <span className="text-gray-600 dark:text-gray-300">Time of Possession</span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {detailedStats.homeTeam.stats.timeOfPossession}
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-600">
                          <span className="text-gray-600 dark:text-gray-300">First Downs</span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {detailedStats.homeTeam.stats.firstDowns}
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-600">
                          <span className="text-gray-600 dark:text-gray-300">Penalties</span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {detailedStats.homeTeam.stats.penalties} ({detailedStats.homeTeam.stats.penaltyYards} yds)
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
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
