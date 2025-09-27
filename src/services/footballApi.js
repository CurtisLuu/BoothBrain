// Football API service using RapidAPI
const RAPIDAPI_KEY = process.env.REACT_APP_RAPIDAPI_KEY || 'your-rapidapi-key-here';
const RAPIDAPI_HOST = 'free-api-live-football-data.p.rapidapi.com';

class FootballApiService {
  constructor() {
    this.baseUrl = 'https://free-api-live-football-data.p.rapidapi.com';
    this.headers = {
      'X-RapidAPI-Key': RAPIDAPI_KEY,
      'X-RapidAPI-Host': RAPIDAPI_HOST,
    };
  }

  // Get NFL games for a specific date
  async getNFLGames(date = null) {
    try {
      const dateParam = date || new Date().toISOString().split('T')[0];
      const url = `${this.baseUrl}/games?date=${dateParam}&league=1`; // League 1 is NFL
      
      const response = await fetch(url, {
        method: 'GET',
        headers: this.headers,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return this.formatNFLGames(data);
    } catch (error) {
      console.error('Error fetching NFL games:', error);
      // Return mock data as fallback
      return this.getMockNFLGames();
    }
  }

  // Get NCAA games for a specific date
  async getNCAAGames(date = null) {
    try {
      const dateParam = date || new Date().toISOString().split('T')[0];
      const url = `${this.baseUrl}/games?date=${dateParam}&league=2`; // League 2 is NCAA
      
      const response = await fetch(url, {
        method: 'GET',
        headers: this.headers,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return this.formatNCAAGames(data);
    } catch (error) {
      console.error('Error fetching NCAA games:', error);
      // Return mock data as fallback
      return this.getMockNCAAGames();
    }
  }

  // Format NFL games data
  formatNFLGames(data) {
    if (!data || !data.games) {
      return this.getMockNFLGames();
    }

    return data.games.map((game, index) => ({
      id: game.id || index + 1,
      homeTeam: game.home_team?.name || 'Home Team',
      awayTeam: game.away_team?.name || 'Away Team',
      homeScore: game.home_score || 0,
      awayScore: game.away_score || 0,
      status: this.getGameStatus(game.status),
      time: this.formatGameTime(game.date),
      week: this.getWeekNumber(game.date),
      homeTeamLogo: game.home_team?.logo,
      awayTeamLogo: game.away_team?.logo,
      league: 'nfl'
    }));
  }

  // Format NCAA games data
  formatNCAAGames(data) {
    if (!data || !data.games) {
      return this.getMockNCAAGames();
    }

    return data.games.map((game, index) => ({
      id: game.id || index + 1,
      homeTeam: game.home_team?.name || 'Home Team',
      awayTeam: game.away_team?.name || 'Away Team',
      homeScore: game.home_score || 0,
      awayScore: game.away_score || 0,
      status: this.getGameStatus(game.status),
      time: this.formatGameTime(game.date),
      week: this.getWeekNumber(game.date),
      homeTeamLogo: game.home_team?.logo,
      awayTeamLogo: game.away_team?.logo,
      league: 'ncaa'
    }));
  }

  // Get game status
  getGameStatus(status) {
    const statusMap = {
      'finished': 'Final',
      'in_progress': 'Live',
      'scheduled': 'Scheduled',
      'postponed': 'Postponed',
      'cancelled': 'Cancelled'
    };
    return statusMap[status] || 'Unknown';
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

  // Get week number (simplified)
  getWeekNumber(dateString) {
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
        week: 'Week 7',
        league: 'ncaa'
      }
    ];
  }
}

const footballApiService = new FootballApiService();
export default footballApiService;
