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
      // Return mock data as fallback
      return this.getMockNFLGames();
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
      // Return mock data as fallback
      return this.getMockNCAAGames();
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
