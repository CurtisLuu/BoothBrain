// Football API service using real sports APIs
import sportsApiService from './sportsApi';

class FootballApiService {
  // No constructor needed - using static methods

  // Get NFL games using real ESPN API
  async getNFLGames(date = null) {
    try {
      console.log('Fetching NFL games from ESPN API...');
      const games = await sportsApiService.getNFLGames();
      console.log('NFL games fetched:', games);
      return games;
    } catch (error) {
      console.error('Error fetching NFL games:', error);
      return [];
    }
  }

  // Get NCAA games using real ESPN API
  async getNCAAGames(date = null) {
    try {
      console.log('Fetching NCAA games from ESPN API...');
      const games = await sportsApiService.getNCAAGames();
      console.log('NCAA games fetched:', games);
      return games;
    } catch (error) {
      console.error('Error fetching NCAA games:', error);
      return [];
    }
  }

  // Get current week number
  async getCurrentWeek(league) {
    try {
      console.log(`Getting current week for ${league}...`);
      const week = await sportsApiService.getCurrentWeek(league);
      console.log(`Current week: ${week}`);
      return week;
    } catch (error) {
      console.error('Error getting current week:', error);
      return 1;
    }
  }

  // Get NFL games by specific week
  async getNFLGamesByWeek(week) {
    try {
      console.log(`Fetching NFL games for week ${week}...`);
      const games = await sportsApiService.getNFLGamesByWeek(week);
      console.log(`Week ${week} NFL games fetched:`, games.length);
      return games;
    } catch (error) {
      console.error(`Error fetching NFL games for week ${week}:`, error);
      return [];
    }
  }

  // Get NCAA games by specific week
  async getNCAAGamesByWeek(week) {
    try {
      console.log(`Fetching NCAA games for week ${week}...`);
      const games = await sportsApiService.getNCAAGamesByWeek(week);
      console.log(`Week ${week} NCAA games fetched:`, games.length);
      return games;
    } catch (error) {
      console.error(`Error fetching NCAA games for week ${week}:`, error);
      return [];
    }
  }

  // Get previous week NFL games using real ESPN API
  async getPreviousWeekNFLGames() {
    try {
      console.log('Fetching previous week NFL games from ESPN API...');
      const games = await sportsApiService.getPreviousWeekNFLGames();
      console.log('Previous week NFL games fetched:', games);
      return games;
    } catch (error) {
      console.error('Error fetching previous week NFL games:', error);
      return [];
    }
  }

  // Get previous week NCAA games using real ESPN API
  async getPreviousWeekNCAAGames() {
    try {
      console.log('Fetching previous week NCAA games from ESPN API...');
      const games = await sportsApiService.getPreviousWeekNCAAGames();
      console.log('Previous week NCAA games fetched:', games);
      return games;
    } catch (error) {
      console.error('Error fetching previous week NCAA games:', error);
      return [];
    }
  }

  // Get next week NFL games using real ESPN API
  async getNextWeekNFLGames() {
    try {
      console.log('Fetching next week NFL games from ESPN API...');
      const games = await sportsApiService.getNextWeekNFLGames();
      console.log('Next week NFL games fetched:', games);
      return games;
    } catch (error) {
      console.error('Error fetching next week NFL games:', error);
      return [];
    }
  }

  // Get next week NCAA games using real ESPN API
  async getNextWeekNCAAGames() {
    try {
      console.log('Fetching next week NCAA games from ESPN API...');
      const games = await sportsApiService.getNextWeekNCAAGames();
      console.log('Next week NCAA games fetched:', games);
      return games;
    } catch (error) {
      console.error('Error fetching next week NCAA games:', error);
      return [];
    }
  }

  // Helper methods for data formatting (kept for compatibility)

  // Mock data fallbacks
  getMockNFLGames() {
    return [
      {
        id: 1,
        homeTeam: 'Kansas City Chiefs',
        awayTeam: 'Buffalo Bills',
        homeScore: 24,
        awayScore: 17,
        status: 'Final',
        time: '4:25 PM ET',
        date: 'Sun, Oct 15',
        week: 'Week 6',
        league: 'nfl'
      },
      {
        id: 2,
        homeTeam: 'Philadelphia Eagles',
        awayTeam: 'Dallas Cowboys',
        homeScore: 28,
        awayScore: 23,
        status: 'Final',
        time: '8:20 PM ET',
        date: 'Sun, Oct 15',
        week: 'Week 6',
        league: 'nfl'
      },
      {
        id: 3,
        homeTeam: 'Miami Dolphins',
        awayTeam: 'New York Jets',
        homeScore: 31,
        awayScore: 21,
        status: 'Final',
        time: '1:00 PM ET',
        date: 'Sun, Oct 15',
        week: 'Week 6',
        league: 'nfl'
      }
    ];
  }

  getMockNCAAGames() {
    return [
      {
        id: 1,
        homeTeam: 'Georgia Bulldogs',
        awayTeam: 'Alabama Crimson Tide',
        homeScore: 27,
        awayScore: 24,
        status: 'Final',
        time: '3:30 PM ET',
        date: 'Sat, Oct 14',
        week: 'Week 7',
        league: 'ncaa'
      },
      {
        id: 2,
        homeTeam: 'Ohio State Buckeyes',
        awayTeam: 'Michigan Wolverines',
        homeScore: 30,
        awayScore: 27,
        status: 'Final',
        time: '12:00 PM ET',
        date: 'Sat, Oct 14',
        week: 'Week 7',
        league: 'ncaa'
      },
      {
        id: 3,
        homeTeam: 'USC Trojans',
        awayTeam: 'UCLA Bruins',
        homeScore: 35,
        awayScore: 28,
        status: 'Final',
        time: '7:30 PM ET',
        date: 'Sat, Oct 14',
        week: 'Week 7',
        league: 'ncaa'
      }
    ];
  }

  // Get game summary with detailed player statistics
  async getGameSummary(eventId, league = 'nfl') {
    try {
      console.log(`Fetching game summary for event ${eventId}...`);
      const summary = await sportsApiService.getGameSummary(eventId, league);
      console.log('Game summary fetched:', summary);
      return summary;
    } catch (error) {
      console.error('Error fetching game summary:', error);
      return null;
    }
  }

  // Get athlete statistics and splits
  async getAthleteStats(athleteId, league = 'nfl') {
    try {
      console.log(`Fetching athlete stats for ${athleteId}...`);
      const stats = await sportsApiService.getAthleteStats(athleteId, league);
      console.log('Athlete stats fetched:', stats);
      return stats;
    } catch (error) {
      console.error('Error fetching athlete stats:', error);
      return null;
    }
  }


  // Get team statistics for a specific team
  async getTeamStats(teamName, league) {
    try {
      console.log(`Fetching team stats for ${teamName} in ${league}...`);
      const teamStats = await sportsApiService.getTeamStats(teamName, league);
      console.log(`Team stats for ${teamName} fetched:`, teamStats);
      return teamStats;
    } catch (error) {
      console.error(`Error fetching team stats for ${teamName}:`, error);
      return null;
    }
  }

  // Get detailed game data using ESPN's core API
  async getGameDetails(gameId, league) {
    try {
      console.log(`Fetching detailed game data for ${gameId} in ${league}...`);
      const gameDetails = await sportsApiService.getGameDetails(gameId, league);
      console.log(`Game details for ${gameId} fetched:`, gameDetails);
      return gameDetails;
    } catch (error) {
      console.error(`Error fetching game details for ${gameId}:`, error);
      return null;
    }
  }

  // Get team statistics using ESPN's core API
  async getTeamStatistics(teamId, league) {
    try {
      console.log(`Fetching team statistics for ${teamId} in ${league}...`);
      const teamStats = await sportsApiService.getTeamStatistics(teamId, league);
      console.log(`Team statistics for ${teamId} fetched:`, teamStats);
      return teamStats;
    } catch (error) {
      console.error(`Error fetching team statistics for ${teamId}:`, error);
      return null;
    }
  }

  // Get comprehensive game boxscore with all player statistics
  async getGameBoxscore(gameId, league) {
    try {
      console.log(`Fetching game boxscore for ${gameId} in ${league}...`);
      const boxscore = await sportsApiService.getGameBoxscore(gameId, league);
      console.log(`Game boxscore for ${gameId} fetched:`, boxscore);
      return boxscore;
    } catch (error) {
      console.error(`Error fetching game boxscore for ${gameId}:`, error);
      return null;
    }
  }

  // Get play-by-play data for detailed game information
  async getGamePlayByPlay(gameId, league) {
    try {
      console.log(`Fetching play-by-play for ${gameId} in ${league}...`);
      const playByPlay = await sportsApiService.getGamePlayByPlay(gameId, league);
      console.log(`Play-by-play for ${gameId} fetched:`, playByPlay);
      return playByPlay;
    } catch (error) {
      console.error(`Error fetching play-by-play for ${gameId}:`, error);
      return null;
    }
  }

  // Get comprehensive game stats and roster using Gemini AI
  async getComprehensiveGameStatsAndRoster(gameId, awayTeam, homeTeam, league = 'nfl', date) {
    try {
      console.log(`🤖 Fetching comprehensive stats from Gemini for ${awayTeam} vs ${homeTeam}...`);
      
      const response = await fetch('http://localhost:8000/game-summary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          game_id: gameId,
          away_team: awayTeam,
          home_team: homeTeam,
          league: league,
          date: date
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('🤖 Comprehensive stats from Gemini:', data);
      return data;
    } catch (error) {
      console.error('💥 Error fetching comprehensive stats from Gemini:', error);
      throw error;
    }
  }

  // Generate announcer report using Gemini AI
  async generateAnnouncerReport(gameId, awayTeam, homeTeam, league = 'nfl', date) {
    try {
      console.log(`📝 Generating announcer report for ${awayTeam} vs ${homeTeam}...`);
      
      const response = await fetch('http://localhost:8000/generate-announcer-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          game_id: gameId,
          away_team: awayTeam,
          home_team: homeTeam,
          league: league,
          date: date
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('📝 Announcer report generated:', data);
      return data;
    } catch (error) {
      console.error('💥 Error generating announcer report:', error);
      throw error;
    }
  }


  // Get team information by name
  async getTeamByName(teamName, league = 'nfl') {
    try {
      console.log(`Finding team: ${teamName}...`);
      const team = await sportsApiService.getTeamByName(teamName, league);
      console.log(`Team found:`, team);
      return team;
    } catch (error) {
      console.error(`Error finding team ${teamName}:`, error);
      return null;
    }
  }

  // Get team roster by team ID
  async getTeamRoster(teamId, league = 'nfl') {
    try {
      console.log(`Fetching roster for team ID: ${teamId}...`);
      const roster = await sportsApiService.getTeamRoster(teamId, league);
      console.log(`Team roster fetched: ${roster.length} players`);
      return roster;
    } catch (error) {
      console.error(`Error fetching roster for team ${teamId}:`, error);
      return [];
    }
  }

  // Get team-specific games (past and future) using real ESPN API
  async getTeamGames(teamName, league) {
    try {
      console.log(`Fetching ${teamName} games from ESPN API for ${league}...`);
      const games = await sportsApiService.getTeamGames(teamName, league);
      console.log(`${teamName} games fetched:`, games);
      console.log(`Games structure:`, {
        hasPastGames: !!games.pastGames,
        hasFutureGames: !!games.futureGames,
        pastGamesLength: games.pastGames?.length || 0,
        futureGamesLength: games.futureGames?.length || 0,
        pastGamesType: typeof games.pastGames,
        futureGamesType: typeof games.futureGames
      });
      
      // Ensure we always return the expected structure
      const result = {
        pastGames: games.pastGames || [],
        futureGames: games.futureGames || []
      };
      
      console.log(`Returning processed games:`, result);
      return result;
    } catch (error) {
      console.error(`Error fetching ${teamName} games:`, error);
      return { pastGames: [], futureGames: [] };
    }
  }
}

const footballApiService = new FootballApiService();
export default footballApiService;
