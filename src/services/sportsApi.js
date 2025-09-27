// Real sports data service using ESPN API and other sources
class SportsApiService {
  constructor() {
    this.espnBaseUrl = 'https://site.api.espn.com/apis/site/v2/sports';
    this.nflUrl = `${this.espnBaseUrl}/football/nfl/scoreboard`;
    this.ncaaUrl = `${this.espnBaseUrl}/football/college-football/scoreboard`;
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
      
      return this.formatESPNGames(data.events || [], 'nfl');
    } catch (error) {
      console.error('Error fetching NFL games from ESPN:', error);
      return this.getMockNFLGames();
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
      
      return this.formatESPNGames(data.events || [], 'ncaa');
    } catch (error) {
      console.error('Error fetching NCAA games from ESPN:', error);
      return this.getMockNCAAGames();
    }
  }

  // Format ESPN API data to our game format
  formatESPNGames(events, league) {
    if (!events || events.length === 0) {
      return league === 'nfl' ? this.getMockNFLGames() : this.getMockNCAAGames();
    }

    return events.slice(0, 3).map((event, index) => {
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
