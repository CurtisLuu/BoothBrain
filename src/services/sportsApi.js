// Real sports data service using ESPN API and other sources
class SportsApiService {
  constructor() {
    this.espnBaseUrl = 'https://site.api.espn.com/apis/site/v2/sports';
    this.nflUrl = `${this.espnBaseUrl}/football/nfl/scoreboard`;
    this.ncaaUrl = `${this.espnBaseUrl}/football/college-football/scoreboard`;
    this.requestDelay = 1000; // 1 second delay between requests
    this.lastRequestTime = 0;
  }

  // Add delay between API requests to avoid rate limiting
  async delayRequest() {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    if (timeSinceLastRequest < this.requestDelay) {
      const delay = this.requestDelay - timeSinceLastRequest;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
    
    this.lastRequestTime = Date.now();
  }

  // Helper function to resolve $ref objects
  resolveRefObjects(obj) {
    if (obj && typeof obj === 'object') {
      if (obj.$ref) {
        // Return a placeholder for $ref objects
        return `[Reference: ${obj.$ref}]`;
      }
      
      if (Array.isArray(obj)) {
        return obj.map(item => this.resolveRefObjects(item));
      }
      
      const resolved = {};
      for (const [key, value] of Object.entries(obj)) {
        resolved[key] = this.resolveRefObjects(value);
      }
      return resolved;
    }
    
    return obj;
  }

  // Get current week number for NFL
  getCurrentWeek() {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentDate = now.toISOString().split('T')[0]; // YYYY-MM-DD format
    
    // Handle 2025 season (current season)
    if (currentYear === 2025) {
      // NFL 2025 season started September 4, 2025 (Week 1)
      if (currentDate >= '2025-09-04' && currentDate < '2025-09-11') return 1;
      if (currentDate >= '2025-09-11' && currentDate < '2025-09-18') return 2;
      if (currentDate >= '2025-09-18' && currentDate < '2025-09-25') return 3;
      if (currentDate >= '2025-09-25' && currentDate < '2025-10-02') return 4;
      if (currentDate >= '2025-10-02' && currentDate < '2025-10-09') return 5;
      if (currentDate >= '2025-10-09' && currentDate < '2025-10-16') return 6;
      if (currentDate >= '2025-10-16' && currentDate < '2025-10-23') return 7;
      if (currentDate >= '2025-10-23' && currentDate < '2025-10-30') return 8;
      if (currentDate >= '2025-10-30' && currentDate < '2025-11-06') return 9;
      if (currentDate >= '2025-11-06' && currentDate < '2025-11-13') return 10;
      if (currentDate >= '2025-11-13' && currentDate < '2025-11-20') return 11;
      if (currentDate >= '2025-11-20' && currentDate < '2025-11-27') return 12;
      if (currentDate >= '2025-11-27' && currentDate < '2025-12-04') return 13;
      if (currentDate >= '2025-12-04' && currentDate < '2025-12-11') return 14;
      if (currentDate >= '2025-12-11' && currentDate < '2025-12-18') return 15;
      if (currentDate >= '2025-12-18' && currentDate < '2025-12-25') return 16;
      if (currentDate >= '2025-12-25' && currentDate < '2026-01-01') return 17;
      if (currentDate >= '2026-01-01' && currentDate < '2026-01-08') return 18;
    }
    
    // Handle 2024 season (fallback)
    if (currentYear === 2024) {
      if (currentDate >= '2024-09-05' && currentDate < '2024-09-12') return 1;
      if (currentDate >= '2024-09-12' && currentDate < '2024-09-19') return 2;
      if (currentDate >= '2024-09-19' && currentDate < '2024-09-26') return 3;
      if (currentDate >= '2024-09-26' && currentDate < '2024-10-03') return 4;
      if (currentDate >= '2024-10-03' && currentDate < '2024-10-10') return 5;
      if (currentDate >= '2024-10-10' && currentDate < '2024-10-17') return 6;
      if (currentDate >= '2024-10-17' && currentDate < '2024-10-24') return 7;
      if (currentDate >= '2024-10-24' && currentDate < '2024-10-31') return 8;
      if (currentDate >= '2024-10-31' && currentDate < '2024-11-07') return 9;
      if (currentDate >= '2024-11-07' && currentDate < '2024-11-14') return 10;
      if (currentDate >= '2024-11-14' && currentDate < '2024-11-21') return 11;
      if (currentDate >= '2024-11-21' && currentDate < '2024-11-28') return 12;
      if (currentDate >= '2024-11-28' && currentDate < '2024-12-05') return 13;
      if (currentDate >= '2024-12-05' && currentDate < '2024-12-12') return 14;
      if (currentDate >= '2024-12-12' && currentDate < '2024-12-19') return 15;
      if (currentDate >= '2024-12-19' && currentDate < '2024-12-26') return 16;
      if (currentDate >= '2024-12-26' && currentDate < '2025-01-02') return 17;
      if (currentDate >= '2025-01-02' && currentDate < '2025-01-09') return 18;
    }
    
    // Fallback: calculate based on season start
    const seasonStart = new Date(currentYear, 8, 4); // September 4th (month is 0-indexed)
    const timeDiff = now - seasonStart;
    const weeksSinceStart = Math.floor(timeDiff / (7 * 24 * 60 * 60 * 1000));
    
    return Math.max(1, Math.min(18, weeksSinceStart + 1));
  }

  // Get current week number for NCAA
  getCurrentNCAAWeek() {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentDate = now.toISOString().split('T')[0]; // YYYY-MM-DD format
    
    // Handle 2025 season (current season)
    if (currentYear === 2025) {
      // NCAA 2025 season typically starts late August
      if (currentDate >= '2025-08-23' && currentDate < '2025-08-30') return 1;
      if (currentDate >= '2025-08-30' && currentDate < '2025-09-06') return 2;
      if (currentDate >= '2025-09-06' && currentDate < '2025-09-13') return 3;
      if (currentDate >= '2025-09-13' && currentDate < '2025-09-20') return 4;
      if (currentDate >= '2025-09-20' && currentDate < '2025-09-27') return 5;
      if (currentDate >= '2025-09-27' && currentDate < '2025-10-04') return 6;
      if (currentDate >= '2025-10-04' && currentDate < '2025-10-11') return 7;
      if (currentDate >= '2025-10-11' && currentDate < '2025-10-18') return 8;
      if (currentDate >= '2025-10-18' && currentDate < '2025-10-25') return 9;
      if (currentDate >= '2025-10-25' && currentDate < '2025-11-01') return 10;
      if (currentDate >= '2025-11-01' && currentDate < '2025-11-08') return 11;
      if (currentDate >= '2025-11-08' && currentDate < '2025-11-15') return 12;
      if (currentDate >= '2025-11-15' && currentDate < '2025-11-22') return 13;
      if (currentDate >= '2025-11-22' && currentDate < '2025-11-29') return 14;
      if (currentDate >= '2025-11-29' && currentDate < '2025-12-06') return 15;
    }
    
    // Handle 2024 season (fallback)
    if (currentYear === 2024) {
      if (currentDate >= '2024-08-24' && currentDate < '2024-08-31') return 1;
      if (currentDate >= '2024-08-31' && currentDate < '2024-09-07') return 2;
      if (currentDate >= '2024-09-07' && currentDate < '2024-09-14') return 3;
      if (currentDate >= '2024-09-14' && currentDate < '2024-09-21') return 4;
      if (currentDate >= '2024-09-21' && currentDate < '2024-09-28') return 5;
      if (currentDate >= '2024-09-28' && currentDate < '2024-10-05') return 6;
      if (currentDate >= '2024-10-05' && currentDate < '2024-10-12') return 7;
      if (currentDate >= '2024-10-12' && currentDate < '2024-10-19') return 8;
      if (currentDate >= '2024-10-19' && currentDate < '2024-10-26') return 9;
      if (currentDate >= '2024-10-26' && currentDate < '2024-11-02') return 10;
      if (currentDate >= '2024-11-02' && currentDate < '2024-11-09') return 11;
      if (currentDate >= '2024-11-09' && currentDate < '2024-11-16') return 12;
      if (currentDate >= '2024-11-16' && currentDate < '2024-11-23') return 13;
      if (currentDate >= '2024-11-23' && currentDate < '2024-11-30') return 14;
      if (currentDate >= '2024-11-30' && currentDate < '2024-12-07') return 15;
    }
    
    // Fallback to calculated week
    const seasonStart = new Date(currentYear, 7, 23); // August 23rd (month is 0-indexed)
    const timeDiff = now - seasonStart;
    const weeksSinceStart = Math.floor(timeDiff / (7 * 24 * 60 * 60 * 1000));
    return Math.max(1, Math.min(15, weeksSinceStart + 1));
  }

  // Get NFL games from ESPN API
  async getNFLGames() {
    try {
      const currentWeek = this.getCurrentWeek();
      console.log(`Fetching NFL games for week ${currentWeek} from ESPN API...`);
      
      const weekUrl = `${this.nflUrl}?week=${currentWeek}`;
      await this.delayRequest();
      
      const response = await fetch(weekUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      if (!response.ok) {
        if (response.status === 404 || response.status === 0) {
          return [];
        }
        throw new Error(`ESPN API error: ${response.status}`);
      }

      const data = await response.json();
      console.log('ESPN NFL API response:', data);
      console.log('Current week NFL events found:', data.events ? data.events.length : 0);

      // Resolve $ref objects to prevent rendering issues
      const resolvedData = this.resolveRefObjects(data);
      return resolvedData.events || [];
    } catch (error) {
      if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
        return [];
      }
      console.error('Error fetching NFL games from ESPN:', error);
      return [];
    }
  }

  // Get NCAA games from ESPN API
  async getNCAAGames() {
    try {
      const currentWeek = this.getCurrentNCAAWeek();
      console.log(`Fetching NCAA games for week ${currentWeek} from ESPN API...`);
      
      const weekUrl = `${this.ncaaUrl}?week=${currentWeek}`;
      await this.delayRequest();
      
      const response = await fetch(weekUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      if (!response.ok) {
        if (response.status === 404 || response.status === 0) {
          return [];
        }
        throw new Error(`ESPN API error: ${response.status}`);
      }

      const data = await response.json();
      console.log('ESPN NCAA API response:', data);
      console.log('Current week NCAA events found:', data.events ? data.events.length : 0);

      // Resolve $ref objects to prevent rendering issues
      const resolvedData = this.resolveRefObjects(data);
      return resolvedData.events || [];
    } catch (error) {
      if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
        return [];
      }
      console.error('Error fetching NCAA games from ESPN:', error);
      return [];
    }
  }

  // Get previous week NFL games from ESPN API
  async getPreviousWeekNFLGames() {
    try {
      const currentWeek = this.getCurrentWeek();
      const previousWeek = Math.max(1, currentWeek - 1);
      console.log(`Fetching previous week (${previousWeek}) NFL games from ESPN API...`);
      
      const previousWeekUrl = `${this.nflUrl}?week=${previousWeek}`;
      await this.delayRequest();
      
      const response = await fetch(previousWeekUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      if (!response.ok) {
        if (response.status === 404 || response.status === 0) {
          return [];
        }
        throw new Error(`ESPN API error: ${response.status}`);
      }

      const data = await response.json();
      console.log('ESPN Previous Week NFL API response:', data);
      console.log('Previous week NFL events found:', data.events ? data.events.length : 0);
      
      return data.events || [];
    } catch (error) {
      if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
        return [];
      }
      console.error('Error fetching previous week NFL games from ESPN:', error);
      return [];
    }
  }

  // Get previous week NCAA games from ESPN API
  async getPreviousWeekNCAAGames() {
    try {
      const currentWeek = this.getCurrentNCAAWeek();
      const previousWeek = Math.max(1, currentWeek - 1);
      console.log(`Fetching previous week (${previousWeek}) NCAA games from ESPN API...`);
      
      const previousWeekUrl = `${this.ncaaUrl}?week=${previousWeek}`;
      await this.delayRequest();
      
      const response = await fetch(previousWeekUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      if (!response.ok) {
        if (response.status === 404 || response.status === 0) {
          return [];
        }
        throw new Error(`ESPN API error: ${response.status}`);
      }

      const data = await response.json();
      console.log('ESPN Previous Week NCAA API response:', data);
      console.log('Previous week NCAA events found:', data.events ? data.events.length : 0);
      
      return data.events || [];
    } catch (error) {
      if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
        return [];
      }
      console.error('Error fetching previous week NCAA games from ESPN:', error);
      return [];
    }
  }

  // Get next week NFL games from ESPN API
  async getNextWeekNFLGames() {
    try {
      const currentWeek = this.getCurrentWeek();
      const nextWeek = Math.min(18, currentWeek + 1);
      console.log(`Fetching next week (${nextWeek}) NFL games from ESPN API...`);
      
      const nextWeekUrl = `${this.nflUrl}?week=${nextWeek}`;
      await this.delayRequest();
      
      const response = await fetch(nextWeekUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      if (!response.ok) {
        if (response.status === 404 || response.status === 0) {
          return [];
        }
        throw new Error(`ESPN API error: ${response.status}`);
      }

      const data = await response.json();
      console.log('ESPN Next Week NFL API response:', data);
      console.log('Next week NFL events found:', data.events ? data.events.length : 0);
      
      return data.events || [];
    } catch (error) {
      if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
        return [];
      }
      console.error('Error fetching next week NFL games from ESPN:', error);
      return [];
    }
  }

  // Get next week NCAA games from ESPN API
  async getNextWeekNCAAGames() {
    try {
      const currentWeek = this.getCurrentNCAAWeek();
      const nextWeek = Math.min(15, currentWeek + 1);
      console.log(`Fetching next week (${nextWeek}) NCAA games from ESPN API...`);
      
      const nextWeekUrl = `${this.ncaaUrl}?week=${nextWeek}`;
      await this.delayRequest();
      
      const response = await fetch(nextWeekUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      if (!response.ok) {
        if (response.status === 404 || response.status === 0) {
          return [];
        }
        throw new Error(`ESPN API error: ${response.status}`);
      }

      const data = await response.json();
      console.log('ESPN Next Week NCAA API response:', data);
      console.log('Next week NCAA events found:', data.events ? data.events.length : 0);
      
      return data.events || [];
    } catch (error) {
      if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
        return [];
      }
      console.error('Error fetching next week NCAA games from ESPN:', error);
      return [];
    }
  }

  // Get NFL games by specific week
  async getNFLGamesByWeek(week) {
    try {
      console.log(`Fetching NFL games for week ${week} from ESPN API...`);
      
      const weekUrl = `${this.nflUrl}?week=${week}`;
      await this.delayRequest();
      
      const response = await fetch(weekUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      if (!response.ok) {
        if (response.status === 404 || response.status === 0) {
          return [];
        }
        throw new Error(`ESPN API error: ${response.status}`);
      }

      const data = await response.json();
      console.log(`ESPN NFL Week ${week} API response:`, data);
      console.log(`Week ${week} NFL events found:`, data.events ? data.events.length : 0);
      
      return data.events || [];
    } catch (error) {
      if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
        return [];
      }
      console.error(`Error fetching NFL games for week ${week} from ESPN:`, error);
      return [];
    }
  }

  // Get NCAA games by specific week
  async getNCAAGamesByWeek(week) {
    try {
      console.log(`Fetching NCAA games for week ${week} from ESPN API...`);
      
      const weekUrl = `${this.ncaaUrl}?week=${week}`;
      await this.delayRequest();
      
      const response = await fetch(weekUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      if (!response.ok) {
        if (response.status === 404 || response.status === 0) {
          return [];
        }
        throw new Error(`ESPN API error: ${response.status}`);
      }

      const data = await response.json();
      console.log(`ESPN NCAA Week ${week} API response:`, data);
      console.log(`Week ${week} NCAA events found:`, data.events ? data.events.length : 0);
      
      return data.events || [];
    } catch (error) {
      if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
        return [];
      }
      console.error(`Error fetching NCAA games for week ${week} from ESPN:`, error);
      return [];
    }
  }

  // Get team statistics for a specific team
  async getTeamStats(teamName, league) {
    try {
      console.log(`Fetching team stats for ${teamName} in ${league}...`);
      
      // Get current week games to find team stats
      const currentWeek = league === 'nfl' ? this.getCurrentWeek() : this.getCurrentNCAAWeek();
      const games = league === 'nfl' ? await this.getNFLGamesByWeek(currentWeek) : await this.getNCAAGamesByWeek(currentWeek);
      
      // Find team in games and extract stats
      let teamStats = {
        teamName: teamName,
        league: league,
        wins: 0,
        losses: 0,
        pointsFor: 0,
        pointsAgainst: 0,
        games: []
      };
      
      // Look through games to find team stats
      for (const game of games) {
        if (game.competitions && game.competitions[0]) {
          const competition = game.competitions[0];
          if (competition.competitors) {
            const homeTeam = competition.competitors.find(c => c.homeAway === 'home');
            const awayTeam = competition.competitors.find(c => c.homeAway === 'away');
            
            if (homeTeam && awayTeam) {
              const homeTeamName = homeTeam.team?.displayName || homeTeam.team?.name;
              const awayTeamName = awayTeam.team?.displayName || awayTeam.team?.name;
              
              if (homeTeamName === teamName || awayTeamName === teamName) {
                const teamCompetitor = homeTeamName === teamName ? homeTeam : awayTeam;
                const opponentCompetitor = homeTeamName === teamName ? awayTeam : homeTeam;
                
                const teamScore = parseInt(teamCompetitor.score || 0);
                const opponentScore = parseInt(opponentCompetitor.score || 0);
                
                teamStats.pointsFor += teamScore;
                teamStats.pointsAgainst += opponentScore;
                
                if (teamScore > opponentScore) {
                  teamStats.wins++;
                } else if (teamScore < opponentScore) {
                  teamStats.losses++;
                }
                
                teamStats.games.push({
                  opponent: opponentCompetitor.team?.displayName || opponentCompetitor.team?.name,
                  teamScore: teamScore,
                  opponentScore: opponentScore,
                  date: game.date,
                  status: game.status?.type?.name
                });
              }
            }
          }
        }
      }
      
      console.log(`Team stats for ${teamName}:`, teamStats);
      return teamStats;
    } catch (error) {
      console.error(`Error fetching team stats for ${teamName}:`, error);
      return null;
    }
  }

  // Get game summary from ESPN API
  async getGameSummary(gameId, league) {
    try {
      console.log(`Fetching game summary for ${gameId} in ${league}...`);
      
      const leaguePath = league === 'nfl' ? 'football/nfl' : 'football/college-football';
      const summaryUrl = `${this.espnBaseUrl}/${leaguePath}/summary?event=${gameId}`;
      
      await this.delayRequest();
      
      const response = await fetch(summaryUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      if (!response.ok) {
        if (response.status === 404 || response.status === 0) {
          return null;
        }
        throw new Error(`ESPN API error: ${response.status}`);
      }

      const data = await response.json();
      console.log(`Game summary for ${gameId}:`, data);
      
      // Resolve $ref objects to prevent rendering issues
      const resolvedData = this.resolveRefObjects(data);
      return resolvedData;
    } catch (error) {
      if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
        return null;
      }
      console.error(`Error fetching game summary for ${gameId}:`, error);
      return null;
    }
  }

  // Get game boxscore from ESPN API
  async getGameBoxscore(gameId, league) {
    try {
      console.log(`Fetching game boxscore for ${gameId} in ${league}...`);
      
      // Try the summary endpoint first as it contains boxscore data
      const leaguePath = league === 'nfl' ? 'football/nfl' : 'football/college-football';
      const summaryUrl = `${this.espnBaseUrl}/${leaguePath}/summary?event=${gameId}`;
      
      await this.delayRequest();
      
      const response = await fetch(summaryUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      if (!response.ok) {
        if (response.status === 404 || response.status === 0) {
          return null;
        }
        throw new Error(`ESPN API error: ${response.status}`);
      }

      const data = await response.json();
      console.log(`Game boxscore for ${gameId}:`, data);
      
      // Resolve $ref objects to prevent rendering issues
      const resolvedData = this.resolveRefObjects(data);
      
      // Extract boxscore data from summary response
      if (resolvedData.boxscore) {
        return resolvedData.boxscore;
      }
      
      return resolvedData;
    } catch (error) {
      if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
        return null;
      }
      console.error(`Error fetching game boxscore for ${gameId}:`, error);
      return null;
    }
  }

  // Get game details from ESPN API
  async getGameDetails(gameId, league) {
    try {
      console.log(`Fetching game details for ${gameId} in ${league}...`);
      
      const leaguePath = league === 'nfl' ? 'football/nfl' : 'football/college-football';
      const detailsUrl = `${this.espnBaseUrl}/${leaguePath}/playbyplay?event=${gameId}`;
      
      await this.delayRequest();
      
      const response = await fetch(detailsUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      if (!response.ok) {
        if (response.status === 404 || response.status === 0) {
      return null;
        }
        throw new Error(`ESPN API error: ${response.status}`);
      }

      const data = await response.json();
      console.log(`Game details for ${gameId}:`, data);
      
      // Resolve $ref objects to prevent rendering issues
      const resolvedData = this.resolveRefObjects(data);
      return resolvedData;
    } catch (error) {
      if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
        return null;
      }
      console.error(`Error fetching game details for ${gameId}:`, error);
      return null;
    }
  }

  // Get athlete statistics from ESPN API
  async getAthleteStats(athleteId, league = 'nfl') {
    try {
      console.log(`Fetching athlete stats for ${athleteId} in ${league}...`);
      
      const leaguePath = league === 'nfl' ? 'football/nfl' : 'football/college-football';
      const athleteUrl = `${this.espnBaseUrl}/${leaguePath}/athletes/${athleteId}/stats`;
      
      await this.delayRequest();
      
      const response = await fetch(athleteUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      if (!response.ok) {
        if (response.status === 404 || response.status === 0) {
          return null;
        }
        throw new Error(`ESPN API error: ${response.status}`);
      }

      const data = await response.json();
      console.log(`Athlete stats for ${athleteId}:`, data);
      return data;
    } catch (error) {
      if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
      return null;
      }
      console.error(`Error fetching athlete stats for ${athleteId}:`, error);
      return null;
    }
  }

  // Get player statistics from game data
  async getPlayerStats(gameId, league) {
    try {
      console.log(`Fetching player stats for game ${gameId} in ${league}...`);
      
      // Get game summary which contains player stats
      const gameSummary = await this.getGameSummary(gameId, league);
      
      if (!gameSummary) {
        return null;
      }
      
      // Extract player stats from the game summary
      const playerStats = {
        gameId: gameId,
        league: league,
        players: []
      };
      
      // Look for player stats in different parts of the response
      if (gameSummary.boxscore && gameSummary.boxscore.players) {
        playerStats.players = gameSummary.boxscore.players;
      } else if (gameSummary.leaders) {
        // Extract from leaders section
        for (const leader of gameSummary.leaders) {
          if (leader.leaders && leader.leaders[0] && leader.leaders[0].leaders) {
            for (const player of leader.leaders[0].leaders) {
              playerStats.players.push({
                name: player.athlete?.displayName || player.athlete?.fullName,
                position: player.athlete?.position?.displayName,
                team: player.team?.displayName,
                stats: player.stats,
                category: leader.displayName
              });
            }
          }
        }
      }
      
      console.log(`Player stats for game ${gameId}:`, playerStats);
      return playerStats;
    } catch (error) {
      console.error(`Error fetching player stats for game ${gameId}:`, error);
      return null;
    }
  }
}

// Create and export a singleton instance
const sportsApiService = new SportsApiService();
module.exports = sportsApiService;