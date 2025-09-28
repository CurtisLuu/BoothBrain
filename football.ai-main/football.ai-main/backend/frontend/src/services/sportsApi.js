// Real sports data service using ESPN API and other sources
class SportsApiService {
  constructor() {
    this.espnBaseUrl = 'https://site.api.espn.com/apis/site/v2/sports';
    this.nflUrl = `${this.espnBaseUrl}/football/nfl/scoreboard`;
    this.ncaaUrl = `${this.espnBaseUrl}/football/college-football/scoreboard`;
  }

  // Get current week number
  getCurrentWeek() {
    const now = new Date();
    const startOfSeason = new Date(now.getFullYear(), 7, 1); // August 1st
    const weeksSinceStart = Math.floor((now - startOfSeason) / (7 * 24 * 60 * 60 * 1000));
    return Math.max(1, weeksSinceStart + 1);
  }

  // Get NFL games from ESPN API
  async getNFLGames() {
    try {
      console.log('Fetching NFL games from ESPN API...');
      
      const response = await fetch(this.nflUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      if (!response.ok) {
        throw new Error(`ESPN API error: ${response.status}`);
      }

      const data = await response.json();
      console.log('ESPN NFL API response:', data);
      console.log('Current week NFL events found:', data.events ? data.events.length : 0);
      console.log('NFL API URL used:', this.nflUrl);
      console.log('NFL week info:', data.week);
      
      return this.formatESPNGames(data.events || [], 'nfl');
    } catch (error) {
      console.error('Error fetching NFL games from ESPN:', error);
      return [];
    }
  }

  // Get NCAA games from ESPN API
  async getNCAAGames() {
    try {
      console.log('Fetching NCAA games from ESPN API...');
      
      const response = await fetch(this.ncaaUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      if (!response.ok) {
        throw new Error(`ESPN API error: ${response.status}`);
      }

      const data = await response.json();
      console.log('ESPN NCAA API response:', data);
      console.log('Current week NCAA events found:', data.events ? data.events.length : 0);
      console.log('NCAA API URL used:', this.ncaaUrl);
      console.log('NCAA week info:', data.week);
      
      return this.formatESPNGames(data.events || [], 'ncaa');
    } catch (error) {
      console.error('Error fetching NCAA games from ESPN:', error);
      return [];
    }
  }

  // Get previous week NFL games from ESPN API
  async getPreviousWeekNFLGames() {
    try {
      console.log('Fetching previous week NFL games from ESPN API...');
      
      // First, get current week to determine previous week number
      const currentResponse = await fetch(this.nflUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      if (!currentResponse.ok) {
        throw new Error(`ESPN API error: ${currentResponse.status}`);
      }

      const currentData = await currentResponse.json();
      const currentWeek = currentData.week?.number || 1;
      const previousWeek = Math.max(1, currentWeek - 1);
      
      console.log('Current week:', currentWeek);
      console.log('Previous week:', previousWeek);
      
      // Fetch games from previous week
      const previousWeekUrl = `${this.nflUrl}?week=${previousWeek}`;
      console.log('Previous week URL:', previousWeekUrl);
      
      const response = await fetch(previousWeekUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      if (!response.ok) {
        throw new Error(`ESPN API error: ${response.status}`);
      }

      const data = await response.json();
      console.log('ESPN Previous Week NFL API response:', data);
      console.log('Previous week events found:', data.events ? data.events.length : 0);
      console.log('Previous week NFL URL used:', previousWeekUrl);
      console.log('Previous week NFL week info:', data.week);
      
      return this.formatESPNGames(data.events || [], 'nfl');
    } catch (error) {
      console.error('Error fetching previous week NFL games from ESPN:', error);
      return [];
    }
  }

  // Get previous week NCAA games from ESPN API
  async getPreviousWeekNCAAGames() {
    try {
      console.log('Fetching previous week NCAA games from ESPN API...');
      
      // First, get current week to determine previous week number
      const currentResponse = await fetch(this.ncaaUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      if (!currentResponse.ok) {
        throw new Error(`ESPN API error: ${currentResponse.status}`);
      }

      const currentData = await currentResponse.json();
      const currentWeek = currentData.week?.number || 1;
      const previousWeek = Math.max(1, currentWeek - 1);
      
      console.log('Current NCAA week:', currentWeek);
      console.log('Previous NCAA week:', previousWeek);
      
      // Fetch games from previous week
      const previousWeekUrl = `${this.ncaaUrl}?week=${previousWeek}`;
      console.log('Previous week NCAA URL:', previousWeekUrl);
      
      const response = await fetch(previousWeekUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      if (!response.ok) {
        throw new Error(`ESPN API error: ${response.status}`);
      }

      const data = await response.json();
      console.log('ESPN Previous Week NCAA API response:', data);
      console.log('Previous week NCAA events found:', data.events ? data.events.length : 0);
      console.log('Previous week NCAA URL used:', previousWeekUrl);
      console.log('Previous week NCAA week info:', data.week);
      
      return this.formatESPNGames(data.events || [], 'ncaa');
    } catch (error) {
      console.error('Error fetching previous week NCAA games from ESPN:', error);
      return [];
    }
  }

  // Get next week NFL games from ESPN API
  async getNextWeekNFLGames() {
    try {
      console.log('Fetching next week NFL games from ESPN API...');
      
      // First, get current week to determine next week number
      const currentResponse = await fetch(this.nflUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      if (!currentResponse.ok) {
        throw new Error(`ESPN API error: ${currentResponse.status}`);
      }

      const currentData = await currentResponse.json();
      const currentWeek = currentData.week?.number || 1;
      const nextWeek = currentWeek + 1;
      
      console.log('Current week:', currentWeek);
      console.log('Next week:', nextWeek);
      
      // Fetch games from next week
      const nextWeekUrl = `${this.nflUrl}?week=${nextWeek}`;
      console.log('Next week URL:', nextWeekUrl);
      
      const response = await fetch(nextWeekUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      if (!response.ok) {
        throw new Error(`ESPN API error: ${response.status}`);
      }

      const data = await response.json();
      console.log('ESPN Next Week NFL API response:', data);
      console.log('Next week events found:', data.events ? data.events.length : 0);
      console.log('Next week NFL URL used:', nextWeekUrl);
      console.log('Next week NFL week info:', data.week);
      
      return this.formatESPNGames(data.events || [], 'nfl');
    } catch (error) {
      console.error('Error fetching next week NFL games from ESPN:', error);
      return [];
    }
  }

  // Get next week NCAA games from ESPN API
  async getNextWeekNCAAGames() {
    try {
      console.log('Fetching next week NCAA games from ESPN API...');
      
      // First, get current week to determine next week number
      const currentResponse = await fetch(this.ncaaUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      if (!currentResponse.ok) {
        throw new Error(`ESPN API error: ${currentResponse.status}`);
      }

      const currentData = await currentResponse.json();
      const currentWeek = currentData.week?.number || 1;
      const nextWeek = currentWeek + 1;
      
      console.log('Current NCAA week:', currentWeek);
      console.log('Next NCAA week:', nextWeek);
      
      // Fetch games from next week
      const nextWeekUrl = `${this.ncaaUrl}?week=${nextWeek}`;
      console.log('Next week NCAA URL:', nextWeekUrl);
      
      const response = await fetch(nextWeekUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      if (!response.ok) {
        throw new Error(`ESPN API error: ${response.status}`);
      }

      const data = await response.json();
      console.log('ESPN Next Week NCAA API response:', data);
      console.log('Next week NCAA events found:', data.events ? data.events.length : 0);
      console.log('Next week NCAA URL used:', nextWeekUrl);
      console.log('Next week NCAA week info:', data.week);
      
      return this.formatESPNGames(data.events || [], 'ncaa');
    } catch (error) {
      console.error('Error fetching next week NCAA games from ESPN:', error);
      return [];
    }
  }

  // Get NFL games by specific week
  async getNFLGamesByWeek(week) {
    try {
      console.log(`Fetching NFL games for week ${week} from ESPN API...`);
      
      const weekUrl = `${this.nflUrl}?week=${week}`;
      
      const response = await fetch(weekUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      if (!response.ok) {
        throw new Error(`ESPN API error: ${response.status}`);
      }

      const data = await response.json();
      console.log(`ESPN NFL Week ${week} API response:`, data);
      console.log(`Week ${week} NFL events found:`, data.events ? data.events.length : 0);
      console.log(`NFL Week ${week} API URL used:`, weekUrl);
      console.log(`NFL Week ${week} info:`, data.week);
      
      return this.formatESPNGames(data.events || [], 'nfl');
    } catch (error) {
      console.error(`Error fetching NFL games for week ${week} from ESPN:`, error);
      return [];
    }
  }

  // Get team statistics for a specific team
  async getTeamStats(teamName, league) {
    try {
      console.log(`Fetching team stats for ${teamName} in ${league} from ESPN API...`);
      
      // Search for team in current season games to get team ID
      const teamId = await this.findTeamId(teamName, league);
      if (!teamId) {
        console.log(`Team ID not found for ${teamName}`);
        return null;
      }

      // Get team statistics
      const teamStatsUrl = `https://site.api.espn.com/apis/site/v2/sports/football/${league}/teams/${teamId}/stats`;
      
      const response = await fetch(teamStatsUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      if (!response.ok) {
        throw new Error(`ESPN API error: ${response.status}`);
      }

      const data = await response.json();
      console.log(`Team stats for ${teamName}:`, data);
      
      return this.formatTeamStats(data, teamName);
    } catch (error) {
      console.error(`Error fetching team stats for ${teamName}:`, error);
      return null;
    }
  }

  // Find team ID by searching through games
  async findTeamId(teamName, league) {
    try {
      console.log(`Searching for team ID for ${teamName} in ${league}...`);
      
      // Get current week games to find team
      const currentWeek = this.getCurrentWeek();
      const games = await this.getNFLGamesByWeek(currentWeek);
      
      // Search for team in games
      const teamGame = games.find(game => 
        game.awayTeam.toLowerCase().includes(teamName.toLowerCase()) ||
        game.homeTeam.toLowerCase().includes(teamName.toLowerCase())
      );
      
      if (teamGame) {
        // Extract team ID from game data
        const teamId = teamGame.awayTeam.toLowerCase().includes(teamName.toLowerCase()) 
          ? teamGame.awayTeamId 
          : teamGame.homeTeamId;
        console.log(`Found team ID for ${teamName}:`, teamId);
        return teamId;
      }
      
      console.log(`Team ID not found for ${teamName}`);
      return null;
    } catch (error) {
      console.error(`Error finding team ID for ${teamName}:`, error);
      return null;
    }
  }

  // Format team statistics from ESPN API
  formatTeamStats(data, teamName) {
    try {
      console.log('Formatting team stats for:', teamName);
      
      if (!data || !data.stats) {
        console.log('No team stats data available');
        return null;
      }

      const stats = data.stats;
      const teamStats = {
        teamName: teamName,
        season: data.season || new Date().getFullYear(),
        stats: {
          offense: {},
          defense: {},
          specialTeams: {}
        }
      };

      // Process offensive stats
      if (stats.offense) {
        teamStats.stats.offense = {
          pointsPerGame: stats.offense.pointsPerGame || 0,
          totalYards: stats.offense.totalYards || 0,
          passingYards: stats.offense.passingYards || 0,
          rushingYards: stats.offense.rushingYards || 0,
          turnovers: stats.offense.turnovers || 0
        };
      }

      // Process defensive stats
      if (stats.defense) {
        teamStats.stats.defense = {
          pointsAllowedPerGame: stats.defense.pointsAllowedPerGame || 0,
          totalYardsAllowed: stats.defense.totalYardsAllowed || 0,
          passingYardsAllowed: stats.defense.passingYardsAllowed || 0,
          rushingYardsAllowed: stats.defense.rushingYardsAllowed || 0,
          takeaways: stats.defense.takeaways || 0
        };
      }

      console.log('Formatted team stats:', teamStats);
      return teamStats;
    } catch (error) {
      console.error('Error formatting team stats:', error);
      return null;
    }
  }

  // Get NCAA games by specific week
  async getNCAAGamesByWeek(week) {
    try {
      console.log(`Fetching NCAA games for week ${week} from ESPN API...`);
      
      const weekUrl = `${this.ncaaUrl}?week=${week}`;
      
      const response = await fetch(weekUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      if (!response.ok) {
        throw new Error(`ESPN API error: ${response.status}`);
      }

      const data = await response.json();
      console.log(`ESPN NCAA Week ${week} API response:`, data);
      console.log(`Week ${week} NCAA events found:`, data.events ? data.events.length : 0);
      console.log(`NCAA Week ${week} API URL used:`, weekUrl);
      console.log(`NCAA Week ${week} info:`, data.week);
      
      return this.formatESPNGames(data.events || [], 'ncaa');
    } catch (error) {
      console.error(`Error fetching NCAA games for week ${week} from ESPN:`, error);
      return [];
    }
  }

  // Get game summary with detailed player statistics
  async getGameSummary(eventId, league = 'nfl') {
    try {
      console.log(`Fetching game summary for event ${eventId} from ESPN API...`);
      
      // Use the correct ESPN API endpoint structure (same as working scoreboard endpoints)
      const sport = league === 'nfl' ? 'football/nfl' : 'football/college-football';
      const summaryUrl = `${this.espnBaseUrl}/${sport}/summary?event=${eventId}`;
      console.log('Game summary URL:', summaryUrl);
      
      const response = await fetch(summaryUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      if (!response.ok) {
        throw new Error(`ESPN API error: ${response.status}`);
      }

      const data = await response.json();
      console.log('ESPN Game Summary API response:', data);
      
      return this.formatGameSummary(data, league);
    } catch (error) {
      console.error('Error fetching game summary from ESPN:', error);
      return null;
    }
  }

  // Get comprehensive game boxscore with all player statistics
  async getGameBoxscore(eventId, league = 'nfl') {
    try {
      console.log(`Fetching game boxscore for event ${eventId} from ESPN API...`);
      
      // Use the correct ESPN API endpoint structure (same as working scoreboard endpoints)
      const sport = league === 'nfl' ? 'football/nfl' : 'football/college-football';
      const boxscoreUrl = `${this.espnBaseUrl}/${sport}/boxscore?event=${eventId}`;
      console.log('Game boxscore URL:', boxscoreUrl);
      
      const response = await fetch(boxscoreUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      if (!response.ok) {
        throw new Error(`ESPN API error: ${response.status}`);
      }

      const data = await response.json();
      console.log('ESPN Game Boxscore API response:', data);
      
      return this.formatGameBoxscore(data, league);
    } catch (error) {
      console.error('Error fetching game boxscore from ESPN:', error);
      return null;
    }
  }

  // Get play-by-play data for more detailed game information
  async getGamePlayByPlay(eventId, league = 'nfl') {
    try {
      console.log(`Fetching play-by-play for event ${eventId} from ESPN API...`);
      
      const sport = league === 'nfl' ? 'football/nfl' : 'football/college-football';
      const playByPlayUrl = `${this.espnBaseUrl}/${sport}/playbyplay?event=${eventId}`;
      console.log('Play-by-play URL:', playByPlayUrl);
      
      const response = await fetch(playByPlayUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      if (!response.ok) {
        throw new Error(`ESPN API error: ${response.status}`);
      }

      const data = await response.json();
      console.log('ESPN Play-by-play API response:', data);
      
      return data;
    } catch (error) {
      console.error('Error fetching play-by-play from ESPN:', error);
      return null;
    }
  }

  // Get detailed game data using ESPN's core API
  async getGameDetails(gameId, league = 'nfl') {
    try {
      console.log(`Fetching detailed game data for ${gameId} in ${league}...`);
      
      // Use ESPN's core API for detailed game information
      const gameUrl = `https://sports.core.api.espn.com/v2/sports/football/leagues/${league}/events/${gameId}`;
      console.log('Game details URL:', gameUrl);
      
      const response = await fetch(gameUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      if (!response.ok) {
        throw new Error(`ESPN Core API error: ${response.status}`);
      }

      const data = await response.json();
      console.log('Game details API response:', data);
      
      return data;
    } catch (error) {
      console.error('Error fetching game details from ESPN Core API:', error);
      return null;
    }
  }

  // Get team statistics using ESPN's core API
  async getTeamStatistics(teamId, league = 'nfl') {
    try {
      console.log(`Fetching team statistics for ${teamId} in ${league}...`);
      
      // Use ESPN's core API for team statistics
      const teamUrl = `https://sports.core.api.espn.com/v2/sports/football/leagues/${league}/teams/${teamId}/statistics`;
      console.log('Team stats URL:', teamUrl);
      
      const response = await fetch(teamUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      if (!response.ok) {
        throw new Error(`ESPN Core API error: ${response.status}`);
      }

      const data = await response.json();
      console.log('Team statistics API response:', data);
      
      return data;
    } catch (error) {
      console.error('Error fetching team statistics from ESPN Core API:', error);
      return null;
    }
  }

  // Get athlete statistics and splits
  async getAthleteStats(athleteId, league = 'nfl') {
    try {
      console.log(`Fetching athlete stats for ${athleteId} from ESPN API...`);
      
      const sport = league === 'nfl' ? 'football/nfl' : 'football/college-football';
      const athleteUrl = `https://site.web.api.espn.com/apis/common/v3/sports/${sport}/athletes/${athleteId}/splits`;
      console.log('Athlete stats URL:', athleteUrl);
      
      const response = await fetch(athleteUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      if (!response.ok) {
        throw new Error(`ESPN API error: ${response.status}`);
      }

      const data = await response.json();
      console.log('ESPN Athlete Stats API response:', data);
      
      return this.formatAthleteStats(data, league);
    } catch (error) {
      console.error('Error fetching athlete stats from ESPN:', error);
      return null;
    }
  }

  // Format ESPN API data to our game format
  formatESPNGames(events, league) {
    if (!events || events.length === 0) {
      console.log(`No events found for ${league}, returning empty array`);
      return [];
    }

    console.log(`Formatting ${events.length} ${league} games from ESPN API`);

    return events.map((event, index) => {
      const competition = event.competitions[0];
      const homeTeam = competition.competitors.find(team => team.homeAway === 'home');
      const awayTeam = competition.competitors.find(team => team.homeAway === 'away');
      
      return {
        id: event.id || index + 1,
        homeTeam: homeTeam?.team?.displayName || 'Home Team',
        awayTeam: awayTeam?.team?.displayName || 'Away Team',
        homeScore: parseInt(homeTeam?.score) || 0,
        awayScore: parseInt(awayTeam?.score) || 0,
        status: this.getGameStatus(competition.status?.type?.name),
        time: this.formatGameTime(event.date),
        date: this.formatGameDate(event.date),
        week: this.getWeekNumber(event.date, league),
        league: league
      };
    });
  }

  // Format game summary data with player statistics
  formatGameSummary(data, league) {
    console.log('Raw ESPN API response structure:', data);
    
    if (!data) {
      console.log('No data available from ESPN API');
      return null;
    }

    // Check different possible data structures
    let players = [];
    let gameInfo = null;

    // Try different possible paths for player data
    if (data.boxscore && data.boxscore.players) {
      players = data.boxscore.players;
      console.log('Found players in data.boxscore.players:', players.length);
    } else if (data.players) {
      players = data.players;
      console.log('Found players in data.players:', players.length);
    } else if (data.boxscore && data.boxscore.teams) {
      // Try to extract players from teams
      const teams = data.boxscore.teams;
      players = [];
      teams.forEach(team => {
        if (team.statistics && team.statistics[0] && team.statistics[0].athletes) {
          players = players.concat(team.statistics[0].athletes);
        }
      });
      console.log('Found players in data.boxscore.teams:', players.length);
    } else {
      console.log('No player data found in any expected location');
      console.log('Available data keys:', Object.keys(data));
      if (data.boxscore) {
        console.log('Boxscore keys:', Object.keys(data.boxscore));
      }
    }

    // Get game info
    if (data.header) {
      gameInfo = data.header;
    } else if (data.gameInfo) {
      gameInfo = data.gameInfo;
    }

    console.log(`Formatting game summary with ${players.length} players`);

    const playerStats = players.map((player, index) => {
      // Handle different player data structures
      let playerData = player;
      let stats = [];
      
      if (player.athlete) {
        playerData = player.athlete;
        stats = player.stats || [];
      } else if (player.stats) {
        stats = player.stats;
      }

      const seasonStats = stats.find(stat => stat.label === 'Season') || { stats: [] };
      const gameStats = stats.find(stat => stat.label === 'Game') || { stats: [] };
      
      return {
        id: playerData?.id || player.id || `player-${index}`,
        name: playerData?.displayName || player.displayName || `Player ${index + 1}`,
        position: playerData?.position?.abbreviation || player.position || 'N/A',
        team: player.team?.displayName || player.team || 'Unknown Team',
        jersey: playerData?.jersey || player.jersey || 'N/A',
        seasonStats: this.formatPlayerStats(seasonStats.stats, league),
        gameStats: this.formatPlayerStats(gameStats.stats, league)
      };
    });

    return {
      gameId: gameInfo?.id || data.id,
      gameInfo: gameInfo,
      players: playerStats
    };
  }

  // Format game boxscore data with comprehensive player statistics
  formatGameBoxscore(data, league) {
    console.log('Raw ESPN Boxscore API response structure:', data);
    
    if (!data) {
      console.log('No boxscore data available from ESPN API');
      return null;
    }

    let players = [];
    let gameInfo = null;
    let teamStats = {};

    // Extract game info
    if (data.header) {
      gameInfo = data.header;
    }

    // Extract team statistics
    if (data.boxscore && data.boxscore.teams) {
      const teams = data.boxscore.teams;
      teams.forEach(team => {
        const teamName = team.team?.displayName || 'Unknown Team';
        teamStats[teamName] = {
          score: team.score || 0,
          statistics: team.statistics || []
        };
      });
    }

    // Extract players from boxscore
    if (data.boxscore && data.boxscore.teams) {
      const teams = data.boxscore.teams;
      players = [];
      
      teams.forEach(team => {
        const teamName = team.team?.displayName || 'Unknown Team';
        
        // Get all statistics categories for this team
        if (team.statistics) {
          team.statistics.forEach(statCategory => {
            if (statCategory.athletes) {
              statCategory.athletes.forEach(athlete => {
                if (athlete.athlete) {
                  const playerData = athlete.athlete;
                  const stats = athlete.stats || [];
                  
                  // Check if we already have this player
                  const existingPlayer = players.find(p => p.id === playerData.id);
                  
                  if (existingPlayer) {
                    // Add stats to existing player
                    existingPlayer.gameStats = {
                      ...existingPlayer.gameStats,
                      ...this.formatPlayerStats(stats, league)
                    };
                  } else {
                    // Create new player
                    players.push({
                      id: playerData.id || `player-${players.length}`,
                      name: playerData.displayName || `Player ${players.length + 1}`,
                      position: playerData.position?.abbreviation || 'N/A',
                      team: teamName,
                      jersey: playerData.jersey || 'N/A',
                      gameStats: this.formatPlayerStats(stats, league),
                      seasonStats: {} // Will be filled by other API calls
                    });
                  }
                }
              });
            }
          });
        }
      });
    }

    console.log(`Formatting boxscore with ${players.length} players`);

    return {
      gameId: gameInfo?.id || data.id,
      gameInfo: gameInfo,
      teamStats: teamStats,
      players: players
    };
  }

  // Format athlete statistics data
  formatAthleteStats(data, league) {
    if (!data || !data.splits) {
      console.log('No athlete splits data available');
      return null;
    }

    const splits = data.splits;
    const seasonStats = splits.find(split => split.displayName === 'Season') || { stats: [] };
    const careerStats = splits.find(split => split.displayName === 'Career') || { stats: [] };
    
    return {
      athleteId: data.athlete?.id,
      name: data.athlete?.displayName || 'Unknown Player',
      position: data.athlete?.position?.abbreviation || 'N/A',
      team: data.athlete?.team?.displayName || 'Unknown Team',
      seasonStats: this.formatPlayerStats(seasonStats.stats, league),
      careerStats: this.formatPlayerStats(careerStats.stats, league)
    };
  }

  // Format individual player statistics
  formatPlayerStats(stats, league) {
    if (!stats || !Array.isArray(stats)) {
      return {};
    }

    const formattedStats = {};
    
    // Common football statistics mapping
    const statMapping = {
      'passingYards': ['passingYards', 'passYards', 'yards'],
      'passingTDs': ['passingTDs', 'passTDs', 'touchdowns'],
      'passingINTs': ['passingINTs', 'passINTs', 'interceptions'],
      'rushingYards': ['rushingYards', 'rushYards', 'rushing'],
      'rushingTDs': ['rushingTDs', 'rushTDs'],
      'receivingYards': ['receivingYards', 'recYards', 'receiving'],
      'receivingTDs': ['receivingTDs', 'recTDs'],
      'receptions': ['receptions', 'rec'],
      'tackles': ['tackles', 'totalTackles'],
      'sacks': ['sacks', 'sack'],
      'interceptions': ['interceptions', 'int', 'ints'],
      'fumbles': ['fumbles', 'fumble'],
      'fumblesRecovered': ['fumblesRecovered', 'fumbleRecoveries']
    };

    stats.forEach(stat => {
      const label = stat.label?.toLowerCase();
      const value = parseFloat(stat.value) || 0;
      
      // Map ESPN stat labels to our standardized format
      for (const [ourKey, espnKeys] of Object.entries(statMapping)) {
        if (espnKeys.some(key => label?.includes(key.toLowerCase()))) {
          formattedStats[ourKey] = value;
          break;
        }
      }
    });

    return formattedStats;
  }

  // Get game status from ESPN status
  getGameStatus(espnStatus) {
    const statusMap = {
      'STATUS_FINAL': 'Final',
      'STATUS_IN_PROGRESS': 'Live',
      'STATUS_SCHEDULED': 'Scheduled',
      'STATUS_POSTPONED': 'Postponed',
      'STATUS_CANCELLED': 'Cancelled'
    };
    return statusMap[espnStatus] || 'Scheduled';
  }

  // Format game time
  formatGameTime(dateString) {
    if (!dateString) return 'TBD';
    
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      timeZoneName: 'short'
    });
  }

  // Format game date
  formatGameDate(dateString) {
    if (!dateString) return 'TBD';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  }

  // Get week number
  getWeekNumber(dateString, league) {
    if (!dateString) return 'Week 1';
    
    const date = new Date(dateString);
    const seasonStart = new Date(date.getFullYear(), 8, 1); // September 1st
    const weekNumber = Math.ceil((date - seasonStart) / (7 * 24 * 60 * 60 * 1000));
    return `Week ${Math.max(1, weekNumber)}`;
  }

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

  // Get team information by name
  async getTeamByName(teamName, league = 'nfl') {
    try {
      console.log(`🔍 Finding team: ${teamName} from ESPN API...`);
      const teamsUrl = `https://sports.core.api.espn.com/v2/sports/football/leagues/nfl/teams?pageSize=32`; // Fetch all 32 teams
      console.log('Teams URL:', teamsUrl);
      
      const response = await fetch(teamsUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      if (!response.ok) {
        throw new Error(`ESPN API error: ${response.status}`);
      }

      const data = await response.json();
      console.log('ESPN Teams API response:', data);
      console.log(`Total teams available: ${data.count}, Retrieved: ${data.items?.length || 0}`);
      console.log('First few teams:', data.items?.slice(0, 5).map(t => ({ name: t.displayName, id: t.id })));
      
      // Find the team by name with multiple matching strategies
      const team = data.items?.find(t => {
        const displayName = t.displayName?.toLowerCase() || '';
        const abbreviation = t.abbreviation?.toLowerCase() || '';
        const searchName = teamName.toLowerCase();
        
        const matches = displayName.includes(searchName) ||
               searchName.includes(displayName) ||
               abbreviation === searchName ||
               displayName === searchName;
        
        if (matches) {
          console.log(`✅ Team match found: "${t.displayName}" for search "${teamName}"`);
        }
        
        return matches;
      });

      if (team) {
        console.log(`✅ Found team: ${team.displayName} (ID: ${team.id})`);
        return {
          id: team.id,
          name: team.displayName,
          abbreviation: team.abbreviation,
          city: team.location,
          conference: team.conference?.name,
          division: team.division?.name
        };
      }

      // Fallback to fetch all pages if not found in first page (though pageSize=32 should cover all NFL teams)
      if (data.pageCount > 1) {
        console.log(`🔄 Team not found in first page, fetching all ${data.pageCount} pages...`);
        return await this.getAllTeamsAndFind(teamName);
      }

      console.log(`❌ Team not found: ${teamName}`);
      console.log('Available teams:', data.items?.map(t => t.displayName));
      return null;
    } catch (error) {
      console.error(`Error finding team ${teamName}:`, error);
      return null;
    }
  }

  // Get all teams and find specific team (fallback for pagination)
  async getAllTeamsAndFind(teamName) {
    try {
      console.log(`🔍 Fetching all teams to find: ${teamName}...`);
      const allTeams = [];
      let pageIndex = 1;
      let hasMorePages = true;
      
      while (hasMorePages) {
        const teamsUrl = `https://sports.core.api.espn.com/v2/sports/football/leagues/nfl/teams?pageIndex=${pageIndex}&pageSize=25`;
        console.log(`Fetching page ${pageIndex}:`, teamsUrl);
        
        const response = await fetch(teamsUrl, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        });

        if (!response.ok) {
          throw new Error(`ESPN API error: ${response.status}`);
        }

        const data = await response.json();
        allTeams.push(...data.items);
        console.log(`Page ${pageIndex}: Found ${data.items.length} teams, Total so far: ${allTeams.length}`);
        hasMorePages = pageIndex < data.pageCount;
        pageIndex++;
      }
      
      console.log(`✅ Fetched all ${allTeams.length} teams across ${pageIndex - 1} pages`);
      
      const team = allTeams.find(t => {
        const displayName = t.displayName?.toLowerCase() || '';
        const abbreviation = t.abbreviation?.toLowerCase() || '';
        const searchName = teamName.toLowerCase();
        return displayName.includes(searchName) || searchName.includes(displayName) || abbreviation === searchName || displayName === searchName;
      });

      if (team) {
        console.log(`✅ Found team: ${team.displayName} (ID: ${team.id})`);
        return {
          id: team.id,
          name: team.displayName,
          abbreviation: team.abbreviation,
          city: team.location,
          conference: team.conference?.name,
          division: team.division?.name
        };
      }
      
      console.log(`❌ Team not found: ${teamName}`);
      console.log('All available teams:', allTeams.map(t => t.displayName));
      return null;
    } catch (error) {
      console.error(`Error fetching all teams for ${teamName}:`, error);
      return null;
    }
  }

  // Get team roster by team ID
  async getTeamRoster(teamId, league = 'nfl') {
    try {
      console.log(`🔍 Fetching roster for team ID: ${teamId} from ESPN API...`);
      const rosterUrl = `https://sports.core.api.espn.com/v2/sports/football/leagues/nfl/teams/${teamId}/athletes`;
      console.log('Team roster URL:', rosterUrl);
      
      const response = await fetch(rosterUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      if (!response.ok) {
        if (response.status === 404) {
          console.log(`⚠️ ESPN roster API not accessible (404) for team ${teamId}. Using fallback data.`);
          return this.generateFallbackRoster(teamId, league);
        }
        throw new Error(`ESPN API error: ${response.status}`);
      }

      const data = await response.json();
      console.log('ESPN Team Roster API response:', data);
      return this.formatTeamRoster(data, teamId);
    } catch (error) {
      console.error(`Error fetching team roster for team ${teamId}:`, error);
      return this.generateFallbackRoster(teamId, league);
    }
  }

  // Generate fallback roster data when ESPN API is not accessible
  generateFallbackRoster(teamId, league = 'nfl') {
    console.log(`📋 Generating fallback roster for team ${teamId}...`);
    
    // NFL team names mapping for fallback data
    const teamNames = {
      '1': 'Arizona Cardinals', '2': 'Atlanta Falcons', '3': 'Baltimore Ravens', '4': 'Buffalo Bills',
      '5': 'Carolina Panthers', '6': 'Chicago Bears', '7': 'Cincinnati Bengals', '8': 'Cleveland Browns',
      '9': 'Dallas Cowboys', '10': 'Denver Broncos', '11': 'Detroit Lions', '12': 'Green Bay Packers',
      '13': 'Houston Texans', '14': 'Indianapolis Colts', '15': 'Jacksonville Jaguars', '16': 'Kansas City Chiefs',
      '17': 'Las Vegas Raiders', '18': 'Los Angeles Chargers', '19': 'Los Angeles Rams', '20': 'Miami Dolphins',
      '21': 'Minnesota Vikings', '22': 'New England Patriots', '23': 'New Orleans Saints', '24': 'New York Giants',
      '25': 'New York Jets', '26': 'Philadelphia Eagles', '27': 'Pittsburgh Steelers', '28': 'San Francisco 49ers',
      '29': 'Seattle Seahawks', '30': 'Tampa Bay Buccaneers', '31': 'Tennessee Titans', '32': 'Washington Commanders'
    };

    const teamName = teamNames[teamId] || `Team ${teamId}`;
    
    // Generate realistic fallback roster data
    const positions = ['QB', 'RB', 'WR', 'TE', 'OL', 'DL', 'LB', 'DB', 'K', 'P'];
    const fallbackRoster = [];
    
    // Generate 53 players (NFL roster size)
    for (let i = 1; i <= 53; i++) {
      const position = positions[Math.floor(Math.random() * positions.length)];
      const jersey = Math.floor(Math.random() * 99) + 1;
      const height = `${Math.floor(Math.random() * 4) + 5}'${Math.floor(Math.random() * 12)}"`;
      const weight = Math.floor(Math.random() * 100) + 200;
      const age = Math.floor(Math.random() * 8) + 22;
      const experience = Math.floor(Math.random() * 10) + 1;
      
      fallbackRoster.push({
        id: `fallback-${teamId}-${i}`,
        name: `Player ${i}`,
        position: position,
        jersey: jersey,
        height: height,
        weight: weight,
        age: age,
        experience: experience,
        team: teamName,
        isFallback: true
      });
    }
    
    console.log(`✅ Generated ${fallbackRoster.length} fallback players for ${teamName}`);
    return fallbackRoster;
  }

  // Format team roster data
  formatTeamRoster(data, teamId) {
    console.log('Formatting team roster data:', data);
    if (!data || !data.items) {
      console.log('No roster data available');
      return [];
    }
    
    const players = data.items.map(player => ({
      id: player.id,
      name: player.displayName,
      firstName: player.firstName,
      lastName: player.lastName,
      position: player.position?.abbreviation || 'N/A',
      jersey: player.jersey || 'N/A',
      teamId: teamId,
      height: player.height,
      weight: player.weight,
      age: player.age,
      experience: player.experience,
      gameStats: {},
      seasonStats: {}
    }));
    
    console.log(`Formatted ${players.length} players for team ${teamId}`);
    return players;
  }
}

const sportsApiService = new SportsApiService();
export default sportsApiService;
