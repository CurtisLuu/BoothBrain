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
    if (!data || !data.boxscore) {
      console.log('No boxscore data available');
      return null;
    }

    const boxscore = data.boxscore;
    const players = boxscore.players || [];
    
    console.log(`Formatting game summary with ${players.length} players`);

    const playerStats = players.map(player => {
      const stats = player.stats || [];
      const seasonStats = stats.find(stat => stat.label === 'Season') || { stats: [] };
      const gameStats = stats.find(stat => stat.label === 'Game') || { stats: [] };
      
      return {
        id: player.athlete?.id,
        name: player.athlete?.displayName || 'Unknown Player',
        position: player.athlete?.position?.abbreviation || 'N/A',
        team: player.team?.displayName || 'Unknown Team',
        jersey: player.athlete?.jersey || 'N/A',
        seasonStats: this.formatPlayerStats(seasonStats.stats, league),
        gameStats: this.formatPlayerStats(gameStats.stats, league)
      };
    });

    return {
      gameId: data.header?.id,
      gameInfo: data.header,
      players: playerStats
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
}

const sportsApiService = new SportsApiService();
export default sportsApiService;
