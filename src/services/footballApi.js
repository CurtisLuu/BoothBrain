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
}

const footballApiService = new FootballApiService();
export default footballApiService;
