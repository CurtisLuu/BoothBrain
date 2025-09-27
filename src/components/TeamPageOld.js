import React, { useState, useEffect } from 'react';
import { ArrowLeft, Trophy, BarChart3, Users, Calendar, TrendingUp } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import footballApi from '../services/footballApi';

const TeamPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [team, setTeam] = useState(null);
  const [teamGames, setTeamGames] = useState([]);
  const [teamStats, setTeamStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeLeague, setActiveLeague] = useState('nfl');

  // Get team from location state
  const teamFromState = location.state?.team;

  useEffect(() => {
    if (teamFromState) {
      setTeam(teamFromState);
      setActiveLeague(teamFromState.league);
      loadTeamData(teamFromState);
    }
  }, [teamFromState]);

  const loadTeamData = async (teamData) => {
    setLoading(true);
    try {
      console.log('Loading team data for:', teamData.name);
      
      // Load games from multiple weeks to get comprehensive team history
      const [currentGames, previousGames, nextGames] = await Promise.all([
        activeLeague === 'nfl' ? footballApi.getNFLGames() : footballApi.getNCAAGames(),
        activeLeague === 'nfl' ? footballApi.getPreviousWeekNFLGames() : footballApi.getPreviousWeekNCAAGames(),
        activeLeague === 'nfl' ? footballApi.getNextWeekNFLGames() : footballApi.getNextWeekNCAAGames()
      ]);

      // Combine all games
      const allGames = [...currentGames, ...previousGames, ...nextGames];
      
      // Filter games that involve this team
      const teamGames = allGames.filter(game => 
        game.awayTeam === teamData.name || game.homeTeam === teamData.name
      );

      console.log('Team games found:', teamGames.length);
      setTeamGames(teamGames);

      // Calculate team statistics
      const stats = calculateTeamStats(teamGames, teamData.name);
      setTeamStats(stats);

    } catch (error) {
      console.error('Error loading team data:', error);
      setTeamGames([]);
      setTeamStats(null);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get current week
  const getCurrentWeek = () => {
    const now = new Date();
    const startOfSeason = new Date(now.getFullYear(), 7, 1); // August 1st
    const weeksSinceStart = Math.floor((now - startOfSeason) / (7 * 24 * 60 * 60 * 1000));
    return Math.max(1, weeksSinceStart + 1);
  };

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
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
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
                  <h1 className="text-xl font-bold text-black dark:text-white">{team.name} Team Page</h1>
                  <p className="text-sm text-gray-700 dark:text-gray-300">Team statistics and match history</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Loading team data...</p>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Team Statistics Overview */}
            {teamStats && (
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                  <BarChart3 className="w-6 h-6 mr-3 text-primary-600" />
                  Team Statistics
                </h2>
                
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
              </div>
            )}

            {/* Match History */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                <Calendar className="w-6 h-6 mr-3 text-primary-600" />
                Match History
              </h2>
              
              {teamGames.length > 0 ? (
                <div className="space-y-4">
                  {teamGames
                    .sort((a, b) => {
                      // Sort by date, most recent first
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
                            </div>
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            Click to view stats
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Calendar className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-300 mb-2">
                    No Games Found
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    No games found for {team.name}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamPage;
