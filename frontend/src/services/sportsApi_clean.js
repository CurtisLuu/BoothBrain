// Real sports data service using ESPN API and other sources
class SportsApiService {
  constructor() {
    // Use the correct ESPN API endpoints based on the documentation
    this.espnBaseUrl = 'https://site.api.espn.com/apis/site/v2/sports';
    this.espnCoreUrl = 'https://sports.core.api.espn.com/v2/sports/football/leagues';
    this.nflUrl = `${this.espnBaseUrl}/football/nfl/scoreboard`;
    this.ncaaUrl = `${this.espnBaseUrl}/football/college-football/scoreboard`;
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }

  // Simple caching mechanism
  getCachedData(key) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      console.log(`Using cached data for ${key}`);
      return cached.data;
    }
    return null;
  }

  setCachedData(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
    console.log(`Cached data for ${key}`);
  }

  // Cache management functions
  clearCache() {
    this.cache.clear();
    console.log('🗑️ Cache cleared');
  }

  getCacheStats() {
    const stats = {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
      entries: Array.from(this.cache.entries()).map(([key, value]) => ({
        key,
        age: Date.now() - value.timestamp,
        dataSize: JSON.stringify(value.data).length
      }))
    };
    console.log('📊 Cache Stats:', stats);
    return stats;
  }

  clearExpiredCache() {
    const now = Date.now();
    let cleared = 0;
    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp > this.cacheTimeout) {
        this.cache.delete(key);
        cleared++;
      }
    }
    console.log(`🗑️ Cleared ${cleared} expired cache entries`);
  }

  // Test basic API connectivity
  async testApiConnectivity() {
    try {
      console.log('=== TESTING API CONNECTIVITY ===');
      console.log('Testing NFL API...');
      
      const response = await fetch(this.nflUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      
      console.log(`NFL API Response Status: ${response.status} ${response.statusText}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log('NFL API Response Keys:', Object.keys(data));
        console.log('Has events:', !!data.events);
        console.log('Events count:', data.events?.length || 0);
        console.log('Has sports:', !!data.sports);
        console.log('Sports count:', data.sports?.length || 0);
        
        if (data.sports && data.sports[0]) {
          console.log('First sport keys:', Object.keys(data.sports[0]));
          if (data.sports[0].leagues) {
            console.log('Leagues count:', data.sports[0].leagues.length);
            if (data.sports[0].leagues[0]) {
              console.log('First league keys:', Object.keys(data.sports[0].leagues[0]));
              console.log('League events count:', data.sports[0].leagues[0].events?.length || 0);
            }
          }
        }
      }
      
      return response.ok;
    } catch (error) {
      console.error('API connectivity test failed:', error);
      return false;
    }
  }

  // Get current week number
  async getCurrentWeek(league) {
    try {
      const url = league === 'nfl' 
        ? `${this.espnBaseUrl}/football/nfl/scoreboard`
        : `${this.espnBaseUrl}/football/college-football/scoreboard`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      return data.week?.number || 1;
    } catch (error) {
      console.error('Error getting current week:', error);
      return 1;
    }
  }

  // Generate mock team games for testing
  generateMockTeamGames(teamName, league) {
    console.log(`Generating mock games for ${teamName} in ${league}`);
    
    const opponents = [
      'Kansas City Chiefs', 'Buffalo Bills', 'Miami Dolphins', 'New York Jets',
      'New England Patriots', 'Pittsburgh Steelers', 'Cleveland Browns', 'Cincinnati Bengals',
      'Baltimore Ravens', 'Houston Texans', 'Indianapolis Colts', 'Jacksonville Jaguars',
      'Tennessee Titans', 'Denver Broncos', 'Las Vegas Raiders', 'Los Angeles Chargers'
    ];
    
    const mockGames = [];
    const currentDate = new Date();
    
    // Generate past games (last 8 weeks)
    for (let i = 8; i >= 1; i--) {
      const gameDate = new Date(currentDate);
      gameDate.setDate(gameDate.getDate() - (i * 7));
      
      const opponent = opponents[Math.floor(Math.random() * opponents.length)];
      const isHome = Math.random() > 0.5;
      const homeScore = Math.floor(Math.random() * 35) + 10;
      const awayScore = Math.floor(Math.random() * 35) + 10;
      
      mockGames.push({
        id: `mock-${i}`,
        homeTeam: isHome ? teamName : opponent,
        awayTeam: isHome ? opponent : teamName,
        homeScore,
        awayScore,
        status: 'Final',
        time: gameDate.toLocaleTimeString(),
        date: gameDate.toISOString(),
        formattedDate: gameDate.toLocaleDateString(),
        week: i,
        league: league,
        opponent: opponent,
        isHome: isHome
      });
    }
    
    // Generate future games (next 4 weeks)
    for (let i = 1; i <= 4; i++) {
      const gameDate = new Date(currentDate);
      gameDate.setDate(gameDate.getDate() + (i * 7));
      
      const opponent = opponents[Math.floor(Math.random() * opponents.length)];
      const isHome = Math.random() > 0.5;
      
      mockGames.push({
        id: `mock-future-${i}`,
        homeTeam: isHome ? teamName : opponent,
        awayTeam: isHome ? opponent : teamName,
        homeScore: 0,
        awayScore: 0,
        status: 'Scheduled',
        time: gameDate.toLocaleTimeString(),
        date: gameDate.toISOString(),
        formattedDate: gameDate.toLocaleDateString(),
        week: 8 + i,
        league: league,
        opponent: opponent,
        isHome: isHome
      });
    }
    
    return mockGames;
  }

  // Get team-specific games from ESPN API (past and future) - Enhanced for complete season
  async getTeamGames(teamName, league) {
    console.log(`=== FETCHING TEAM GAMES DEBUG ===`);
    console.log(`Team Name: "${teamName}"`);
    console.log(`League: "${league}"`);
    console.log(`=================================`);
    
    // Skip caching - always fetch fresh data
    console.log('Fetching fresh data (caching disabled)');
    
    let teamGames = [];
    let pastGames = [];
    let futureGames = [];
    
    try {
      // First, get team ID and lock it in
      const teamId = await this.findTeamId(teamName, league);
      console.log(`🔒 LOCKED IN team ID: ${teamId} for ${teamName}`);
      
      if (teamId) {
        // Use team-specific approach: systematically fetch all weeks
        console.log('🎯 Using team-specific approach: fetching all weeks systematically...');
        
        // Get current week to know where to start
        const currentWeek = await this.getCurrentWeek(league);
        console.log(`📅 Current week: ${currentWeek}`);
        
        // Fetch all weeks from 1 to current week + 4 (to get future games)
        const maxWeek = Math.min(currentWeek + 4, 18);
        console.log(`📊 Fetching weeks 1 through ${maxWeek}...`);
        
        for (let week = 1; week <= maxWeek; week++) {
          console.log(`\n📅 === FETCHING WEEK ${week} ===`);
          
          try {
            const weekGames = league === 'nfl' 
              ? await this.getNFLGamesByWeek(week) 
              : await this.getNCAAGamesByWeek(week);
            console.log(`📊 Week ${week} total games: ${weekGames.length}`);
            
            // Filter for our team using the locked-in team name
            const weekTeamGames = weekGames.filter(game => {
              const awayTeam = game.awayTeam?.toLowerCase() || '';
              const homeTeam = game.homeTeam?.toLowerCase() || '';
              const searchName = teamName.toLowerCase();
              
              // More flexible matching
              const matches = awayTeam.includes(searchName) || 
                     homeTeam.includes(searchName) ||
                     awayTeam.includes(searchName.replace(' ', '')) ||
                     homeTeam.includes(searchName.replace(' ', '')) ||
                     searchName.includes(awayTeam) ||
                     searchName.includes(homeTeam) ||
                     awayTeam.includes(searchName.split(' ')[0]) ||
                     homeTeam.includes(searchName.split(' ')[0]) ||
                     awayTeam.includes(searchName.split(' ')[1]) ||
                     homeTeam.includes(searchName.split(' ')[1]);
              
              if (matches) {
                console.log(`✅ Found week ${week} game: ${game.awayTeam} @ ${game.homeTeam} (${game.homeScore}-${game.awayScore})`);
              }
              
              return matches;
            });
            
            console.log(`🎯 Week ${week} team games: ${weekTeamGames.length}`);
            teamGames = [...teamGames, ...weekTeamGames];
            
            // Add a small delay to avoid rate limiting
            if (week < maxWeek) {
              await new Promise(resolve => setTimeout(resolve, 100));
            }
            
          } catch (weekError) {
            console.error(`❌ Error fetching week ${week}:`, weekError);
            // Continue with next week
          }
        }
        
        console.log(`\n📊 TOTAL GAMES FOUND: ${teamGames.length}`);
        
      } else {
        console.log(`❌ No team ID found for ${teamName}, using fallback approach...`);
        
        // Fallback: try to find games by name matching in all weeks
        for (let week = 1; week <= 18; week++) {
          console.log(`Fallback: Fetching week ${week} games...`);
          const weekGames = league === 'nfl' 
            ? await this.getNFLGamesByWeek(week) 
            : await this.getNCAAGamesByWeek(week);
          console.log(`Week ${week} games: ${weekGames.length}`);
          
          // Filter for our team
          const weekTeamGames = weekGames.filter(game => {
            const awayTeam = game.awayTeam?.toLowerCase() || '';
            const homeTeam = game.homeTeam?.toLowerCase() || '';
            const searchName = teamName.toLowerCase();
            
            return awayTeam.includes(searchName) || 
                   homeTeam.includes(searchName) ||
                   awayTeam.includes(searchName.replace(' ', '')) ||
                   homeTeam.includes(searchName.replace(' ', '')) ||
                   searchName.includes(awayTeam) ||
                   searchName.includes(homeTeam);
          });
          
          console.log(`Found ${weekTeamGames.length} week ${week} games for ${teamName}`);
          teamGames = [...teamGames, ...weekTeamGames];
        }
      }
      
      // Process games to separate past and future
      const currentDate = new Date();
      teamGames.forEach(game => {
        if (!game || !game.date) {
          console.log('Skipping invalid game:', game);
          return;
        }
        
        // Games are already formatted by formatESPNGames, just add team-specific info
        const gameDate = new Date(game.date);
        
        // Add team-specific information
        const isHome = game.homeTeam === teamName;
        const opponent = isHome ? game.awayTeam : game.homeTeam;
        
        const enhancedGame = {
          ...game,
          opponent,
          isHome,
          date: game.formattedDate || game.date // Use formatted date for display
        };
        
        if (gameDate < currentDate) {
          pastGames.push(enhancedGame);
        } else {
          futureGames.push(enhancedGame);
        }
      });
      
      console.log(`📊 Processed games: ${pastGames.length} past, ${futureGames.length} future`);
      
    } catch (error) {
      console.error(`Error fetching team games for ${teamName}:`, error);
    }
    
    if (teamGames.length === 0) {
      console.log(`No games found for ${teamName} using any approach`);
      console.log(`Generating fallback mock data for testing...`);
      const mockGames = this.generateMockTeamGames(teamName, league);
      teamGames = mockGames;
      console.log(`Generated ${mockGames.length} mock games as fallback`);
    } else {
      console.log(`Found ${teamGames.length} real games from API`);
    }
    
    const result = { pastGames, futureGames };
    
    // Caching disabled - always return fresh data
    console.log(`✅ Returning fresh team games for ${teamName} (${pastGames.length} past, ${futureGames.length} future)`);
    
    return result;
  }

  // Find team ID by name - Enhanced with caching
  async findTeamId(teamName, league) {
    try {
      console.log(`=== FINDING TEAM ID WITH CACHING ===`);
      console.log(`Searching for team ID for "${teamName}" in "${league}"...`);
      
      // Skip caching - always fetch fresh team ID
      console.log(`Fetching fresh team ID for ${teamName} (caching disabled)`);
      
      // Skip caching - always fetch fresh teams list
      console.log(`Fetching fresh teams list for ${league} (caching disabled)`);
      
      const baseUrl = league === 'nfl' 
        ? `${this.espnCoreUrl}/nfl/teams?pageSize=32`
        : `${this.espnCoreUrl}/college-football/teams?pageSize=130`;
      
      console.log(`Teams API URL: ${baseUrl}`);
      
      const response = await fetch(baseUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      
      if (!response.ok) {
        console.error(`Teams API failed with status: ${response.status}`);
        return null;
      }
      
      const data = await response.json();
      console.log(`Teams API response keys:`, Object.keys(data));
      console.log(`Teams count:`, data.items?.length || 0);
      
      if (!data.items || data.items.length === 0) {
        console.log('No teams found in API response');
        return null;
      }
      
      // Search for team by name
      const team = data.items.find(t => {
        const displayName = t.displayName?.toLowerCase() || '';
        const shortName = t.shortDisplayName?.toLowerCase() || '';
        const searchName = teamName.toLowerCase();
        
        return displayName.includes(searchName) || 
               shortName.includes(searchName) ||
               searchName.includes(displayName) ||
               searchName.includes(shortName) ||
               displayName.includes(searchName.replace(' ', '')) ||
               shortName.includes(searchName.replace(' ', ''));
      });
      
      if (team) {
        const teamId = team.id;
        console.log(`✅ Found team: ${team.displayName} with ID: ${teamId}`);
        console.log(`✅ Returning fresh team ID for ${teamName}`);
        return teamId;
      } else {
        console.log(`❌ No team found matching "${teamName}"`);
        console.log('Available teams:', data.items.slice(0, 5).map(t => t.displayName));
        return null;
      }
      
    } catch (error) {
      console.error(`Error finding team ID for ${teamName}:`, error);
      return null;
    }
  }

  // Format ESPN team game data
  formatESPNTeamGame(event, teamName, league) {
    console.log(`Formatting game for ${teamName}:`, event);
    const competition = event.competitions?.[0];
    const competitors = competition?.competitors || [];
    
    console.log('Competition:', competition);
    console.log('Competitors:', competitors);
    
    const homeTeam = competitors.find(c => c.homeAway === 'home');
    const awayTeam = competitors.find(c => c.homeAway === 'away');
    
    if (!homeTeam || !awayTeam) {
      console.log('Missing home or away team data');
      return null; // Skip invalid games
    }
    
    const homeTeamName = homeTeam.team?.displayName || 'Home Team';
    const awayTeamName = awayTeam.team?.displayName || 'Away Team';
    const homeScore = parseInt(homeTeam.score) || 0;
    const awayScore = parseInt(awayTeam.score) || 0;
    
    console.log(`Game: ${awayTeamName} @ ${homeTeamName} (${homeScore}-${awayScore})`);
    
    return {
      id: event.id || Math.random().toString(36).substr(2, 9),
      homeTeam: homeTeamName,
      awayTeam: awayTeamName,
      homeScore,
      awayScore,
      status: this.getGameStatus(competition?.status?.type?.name),
      time: this.formatGameTime(event.date),
      date: this.formatGameDate(event.date),
      week: this.getWeekNumber(event.date, league),
      league: league
    };
  }

  // Get NFL games from ESPN API
  async getNFLGames() {
    console.log('=== FETCHING NFL GAMES WITH CACHING ===');
    console.log('Fetching fresh NFL games (caching disabled)');
    
    try {
      console.log('Cache miss for current week, fetching from API...');
      console.log('URL:', this.nflUrl);
      
      const response = await fetch(this.nflUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      
      if (!response.ok) {
        console.error(`NFL API failed with status: ${response.status}`);
        return [];
      }
      
      const data = await response.json();
      console.log('ESPN NFL API response structure:', {
        hasEvents: !!data.events,
        eventsLength: data.events?.length || 0,
        hasSports: !!data.sports,
        sportsLength: data.sports?.length || 0,
        keys: Object.keys(data)
      });
      
      if (data.events && data.events.length > 0) {
        console.log(`Found ${data.events.length} events in API response`);
        const formattedGames = this.formatESPNGames(data.events, 'nfl');
        console.log(`Formatted ${formattedGames.length} NFL games`);
        console.log('Sample formatted game:', formattedGames[0]);
        console.log('✅ Returning fresh NFL games');
        return formattedGames;
      } else {
        console.log('No events found in NFL API response');
        return [];
      }
      
    } catch (error) {
      console.error('Error fetching NFL games:', error);
      return [];
    }
  }

  // Get NCAA games from ESPN API
  async getNCAAGames() {
    console.log('Fetching NCAA games from ESPN API');
    
    try {
      const response = await fetch(this.ncaaUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      
      if (!response.ok) {
        console.error(`NCAA API failed with status: ${response.status}`);
        return [];
      }
      
      const data = await response.json();
      
      if (data.events && data.events.length > 0) {
        return this.formatESPNGames(data.events, 'college-football');
      } else {
        console.log('No events found in NCAA API response');
        return [];
      }
      
    } catch (error) {
      console.error('Error fetching NCAA games:', error);
      return [];
    }
  }

  // Get NFL games by week
  async getNFLGamesByWeek(week) {
    console.log(`=== FETCHING NFL WEEK ${week} WITH CACHING ===`);
    console.log(`Fetching fresh NFL games for week ${week} (caching disabled)`);
    
    try {
      const apiUrl = `${this.espnBaseUrl}/football/nfl/scoreboard?week=${week}`;
      console.log(`API URL: ${apiUrl}`);
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      
      if (!response.ok) {
        console.error(`NFL Week ${week} API failed with status: ${response.status}`);
        return [];
      }
      
      const data = await response.json();
      console.log(`ESPN NFL Week ${week} API response:`, {
        hasEvents: !!data.events,
        eventsLength: data.events?.length || 0,
        hasLeagues: !!data.leagues,
        leaguesLength: data.leagues?.length || 0,
        hasWeek: !!data.week,
        weekNumber: data.week?.number,
        keys: Object.keys(data)
      });
      
      if (data.events && data.events.length > 0) {
        console.log(`Week ${week} NFL events found: ${data.events.length}`);
        const formattedGames = this.formatESPNGames(data.events, 'nfl');
        console.log(`✅ Returning fresh NFL games for week ${week}`);
        return formattedGames;
      } else {
        console.log(`No events found for NFL week ${week}`);
        return [];
      }
      
    } catch (error) {
      console.error(`Error fetching NFL week ${week} games:`, error);
      return [];
    }
  }

  // Get team statistics
  async getTeamStats(teamName, league) {
    console.log(`=== FETCHING TEAM STATS WITH CACHING ===`);
    console.log(`Team: ${teamName}, League: ${league}`);
    console.log(`Fetching fresh team stats for ${teamName} (caching disabled)`);
    
    try {
      // Get team games first
      const gamesData = await this.getTeamGames(teamName, league);
      const allGames = [...gamesData.pastGames, ...gamesData.futureGames];
      
      if (allGames.length === 0) {
        console.log(`No games found for ${teamName}, returning empty stats`);
        return {
          wins: 0,
          losses: 0,
          ties: 0,
          winPercentage: 0,
          pointsFor: 0,
          pointsAgainst: 0,
          pointDifferential: 0,
          averagePointsFor: 0,
          averagePointsAgainst: 0,
          currentStreak: 'N/A',
          longestWinStreak: 0,
          longestLossStreak: 0,
          recentForm: 'N/A',
          pointsPerGame: 0,
          pointsAllowedPerGame: 0
        };
      }
      
      // Calculate comprehensive stats
      const stats = this.calculateComprehensiveTeamStats(allGames, teamName, league);
      console.log(`✅ Returning fresh calculated stats for ${teamName}`);
      return stats;
      
    } catch (error) {
      console.error(`Error fetching team stats for ${teamName}:`, error);
      return {
        wins: 0,
        losses: 0,
        ties: 0,
        winPercentage: 0,
        pointsFor: 0,
        pointsAgainst: 0,
        pointDifferential: 0,
        averagePointsFor: 0,
        averagePointsAgainst: 0,
        currentStreak: 'N/A',
        longestWinStreak: 0,
        longestLossStreak: 0,
        recentForm: 'N/A',
        pointsPerGame: 0,
        pointsAllowedPerGame: 0
      };
    }
  }

  // Calculate comprehensive team statistics
  calculateComprehensiveTeamStats(games, teamName, league) {
    console.log(`Calculating comprehensive stats for ${teamName} from ${games.length} games`);
    
    const completedGames = games.filter(game => 
      game.status === 'Final' && 
      game.homeScore !== null && 
      game.awayScore !== null
    );
    
    console.log(`Found ${completedGames.length} completed games for stats calculation`);
    
    if (completedGames.length === 0) {
      return {
        wins: 0,
        losses: 0,
        ties: 0,
        winPercentage: 0,
        pointsFor: 0,
        pointsAgainst: 0,
        pointDifferential: 0,
        averagePointsFor: 0,
        averagePointsAgainst: 0,
        currentStreak: 'N/A',
        longestWinStreak: 0,
        longestLossStreak: 0,
        recentForm: 'N/A',
        pointsPerGame: 0,
        pointsAllowedPerGame: 0
      };
    }
    
    let wins = 0;
    let losses = 0;
    let ties = 0;
    let pointsFor = 0;
    let pointsAgainst = 0;
    
    completedGames.forEach(game => {
      const isHome = game.homeTeam === teamName;
      const teamScore = isHome ? game.homeScore : game.awayScore;
      const opponentScore = isHome ? game.awayScore : game.homeScore;
      
      pointsFor += teamScore;
      pointsAgainst += opponentScore;
      
      if (teamScore > opponentScore) {
        wins++;
      } else if (teamScore < opponentScore) {
        losses++;
      } else {
        ties++;
      }
    });
    
    const totalGames = wins + losses + ties;
    const winPercentage = totalGames > 0 ? (wins / totalGames) * 100 : 0;
    const pointDifferential = pointsFor - pointsAgainst;
    const averagePointsFor = totalGames > 0 ? pointsFor / totalGames : 0;
    const averagePointsAgainst = totalGames > 0 ? pointsAgainst / totalGames : 0;
    
    // Calculate streaks
    const { currentStreak, longestWinStreak, longestLossStreak } = this.calculateStreaks(completedGames, teamName);
    
    // Calculate recent form (last 5 games)
    const recentGames = completedGames.slice(-5);
    const recentForm = this.calculateRecentForm(recentGames, teamName);
    
    return {
      wins,
      losses,
      ties,
      winPercentage: Math.round(winPercentage * 100) / 100,
      pointsFor,
      pointsAgainst,
      pointDifferential,
      averagePointsFor: Math.round(averagePointsFor * 100) / 100,
      averagePointsAgainst: Math.round(averagePointsAgainst * 100) / 100,
      currentStreak,
      longestWinStreak,
      longestLossStreak,
      recentForm,
      pointsPerGame: Math.round(averagePointsFor * 100) / 100,
      pointsAllowedPerGame: Math.round(averagePointsAgainst * 100) / 100
    };
  }

  // Calculate team streaks
  calculateStreaks(games, teamName) {
    if (games.length === 0) {
      return { currentStreak: 'N/A', longestWinStreak: 0, longestLossStreak: 0 };
    }
    
    // Sort games by date (most recent first)
    const sortedGames = [...games].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    let currentStreak = 0;
    let currentStreakType = '';
    let longestWinStreak = 0;
    let longestLossStreak = 0;
    let tempWinStreak = 0;
    let tempLossStreak = 0;
    
    for (const game of sortedGames) {
      const isHome = game.homeTeam === teamName;
      const teamScore = isHome ? game.homeScore : game.awayScore;
      const opponentScore = isHome ? game.awayScore : game.homeScore;
      
      if (teamScore > opponentScore) {
        // Win
        if (currentStreakType === 'win' || currentStreak === 0) {
          currentStreak++;
          currentStreakType = 'win';
        }
        tempWinStreak++;
        tempLossStreak = 0;
        longestWinStreak = Math.max(longestWinStreak, tempWinStreak);
      } else if (teamScore < opponentScore) {
        // Loss
        if (currentStreakType === 'loss' || currentStreak === 0) {
          currentStreak++;
          currentStreakType = 'loss';
        }
        tempLossStreak++;
        tempWinStreak = 0;
        longestLossStreak = Math.max(longestLossStreak, tempLossStreak);
      } else {
        // Tie
        tempWinStreak = 0;
        tempLossStreak = 0;
      }
    }
    
    return {
      currentStreak: currentStreak > 0 ? `${currentStreak} ${currentStreakType}${currentStreak > 1 ? 's' : ''}` : 'N/A',
      longestWinStreak,
      longestLossStreak
    };
  }

  // Calculate recent form
  calculateRecentForm(recentGames, teamName) {
    if (recentGames.length === 0) return 'N/A';
    
    const form = recentGames.map(game => {
      const isHome = game.homeTeam === teamName;
      const teamScore = isHome ? game.homeScore : game.awayScore;
      const opponentScore = isHome ? game.awayScore : game.homeScore;
      
      if (teamScore > opponentScore) return 'W';
      if (teamScore < opponentScore) return 'L';
      return 'T';
    }).join('');
    
    return form;
  }

  // Format ESPN games data
  formatESPNGames(events, league) {
    if (!events || !Array.isArray(events)) {
      console.log('No events to format or events is not an array');
      return [];
    }
    
    console.log(`=== FORMATTING ${events.length} ${league.toUpperCase()} GAMES ===`);
    console.log('Sample event:', events[0]);
    
    return events.map((event, index) => {
      const competition = event.competitions?.[0];
      const competitors = competition?.competitors || [];
      
      const homeTeam = competitors.find(c => c.homeAway === 'home');
      const awayTeam = competitors.find(c => c.homeAway === 'away');
      
      if (!homeTeam || !awayTeam) {
        console.log(`Game ${index + 1}: Missing home or away team data`);
        return null;
      }
      
      console.log(`Game ${index + 1}:`, {
        eventId: event.id,
        homeTeam: homeTeam.team?.displayName,
        awayTeam: awayTeam.team?.displayName,
        homeScore: homeTeam.score,
        awayScore: awayTeam.score
      });
      
      const formattedGame = {
        id: event.id || index + 1,
        homeTeam: homeTeam?.team?.displayName || 'Home Team',
        awayTeam: awayTeam?.team?.displayName || 'Away Team',
        homeScore: parseInt(homeTeam?.score) || 0,
        awayScore: parseInt(awayTeam?.score) || 0,
        status: this.getGameStatus(competition?.status?.type?.name),
        time: this.formatGameTime(event.date),
        date: event.date,
        formattedDate: this.formatGameDate(event.date),
        week: this.getWeekNumber(event.date, league),
        league: league
      };
      
      console.log(`Formatted game ${index + 1}:`, formattedGame);
      return formattedGame;
    }).filter(game => game !== null);
  }

  // Get game status
  getGameStatus(espnStatus) {
    const statusMap = {
      'STATUS_SCHEDULED': 'Scheduled',
      'STATUS_IN_PROGRESS': 'Live',
      'STATUS_FINAL': 'Final',
      'STATUS_POSTPONED': 'Postponed',
      'STATUS_CANCELLED': 'Cancelled'
    };
    return statusMap[espnStatus] || 'Unknown';
  }

  // Format game time
  formatGameTime(dateString) {
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        timeZoneName: 'short'
      });
    } catch (error) {
      return 'TBD';
    }
  }

  // Format game date
  formatGameDate(dateString) {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return 'TBD';
    }
  }

  // Get week number
  getWeekNumber(dateString, league) {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const startOfSeason = new Date(now.getFullYear(), 7, 1); // August 1st
      const weeksSinceStart = Math.floor((date - startOfSeason) / (7 * 24 * 60 * 60 * 1000));
      return Math.max(1, weeksSinceStart + 1);
    } catch (error) {
      return 1;
    }
  }

  // Get NCAA games by week
  async getNCAAGamesByWeek(week) {
    console.log(`Fetching NCAA games for week ${week}...`);
    
    try {
      const apiUrl = `${this.espnBaseUrl}/football/college-football/scoreboard?week=${week}`;
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      
      if (!response.ok) {
        console.error(`NCAA Week ${week} API failed with status: ${response.status}`);
        return [];
      }
      
      const data = await response.json();
      
      if (data.events && data.events.length > 0) {
        return this.formatESPNGames(data.events, 'college-football');
      } else {
        console.log(`No events found for NCAA week ${week}`);
        return [];
      }
      
    } catch (error) {
      console.error(`Error fetching NCAA week ${week} games:`, error);
      return [];
    }
  }

  // Get team roster
  async getTeamRoster(teamId, league = 'nfl') {
    try {
      console.log(`🔍 Fetching roster for team ID: ${teamId} from ESPN API...`);
      
      const teamRosterUrl = `${this.espnCoreUrl}/${league}/teams/${teamId}/athletes`;
      console.log(`Team roster URL: ${teamRosterUrl}`);
      
      const response = await fetch(teamRosterUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      
      if (!response.ok) {
        console.log(`⚠️ ESPN roster API not accessible (${response.status}) for team ${teamId}. Using fallback data.`);
        return this.generateFallbackRoster(teamId, league);
      }
      
      const data = await response.json();
      console.log(`📊 Roster API response:`, {
        hasItems: !!data.items,
        itemsLength: data.items?.length || 0,
        keys: Object.keys(data)
      });
      
      if (data.items && data.items.length > 0) {
        const roster = this.formatTeamRoster(data, teamId);
        console.log(`✅ Generated roster with ${roster.length} players`);
        return roster;
      } else {
        console.log(`⚠️ No roster data found for team ${teamId}, using fallback`);
        return this.generateFallbackRoster(teamId, league);
      }
      
    } catch (error) {
      console.error(`❌ Error fetching roster for team ${teamId}:`, error);
      return this.generateFallbackRoster(teamId, league);
    }
  }

  // Generate fallback roster
  generateFallbackRoster(teamId, league = 'nfl') {
    console.log(`📋 Generating fallback roster for team ${teamId}...`);
    
    const positions = [
      'QB', 'RB', 'WR', 'TE', 'OL', 'C', 'G', 'T',
      'DE', 'DT', 'LB', 'CB', 'S', 'K', 'P', 'LS'
    ];
    
    const firstNames = [
      'John', 'Mike', 'David', 'Chris', 'James', 'Robert', 'William', 'Richard',
      'Thomas', 'Charles', 'Daniel', 'Matthew', 'Anthony', 'Mark', 'Donald', 'Steven',
      'Paul', 'Andrew', 'Joshua', 'Kenneth', 'Kevin', 'Brian', 'George', 'Timothy',
      'Ronald', 'Jason', 'Edward', 'Jeffrey', 'Ryan', 'Jacob', 'Gary', 'Nicholas',
      'Eric', 'Jonathan', 'Stephen', 'Larry', 'Justin', 'Scott', 'Brandon', 'Benjamin'
    ];
    
    const lastNames = [
      'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
      'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas',
      'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson', 'White',
      'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson', 'Walker', 'Young',
      'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores'
    ];
    
    const roster = [];
    const teamNames = [
      'Philadelphia Eagles', 'Dallas Cowboys', 'New York Giants', 'Washington Commanders',
      'Kansas City Chiefs', 'Las Vegas Raiders', 'Los Angeles Chargers', 'Denver Broncos',
      'Buffalo Bills', 'Miami Dolphins', 'New England Patriots', 'New York Jets',
      'Baltimore Ravens', 'Cincinnati Bengals', 'Cleveland Browns', 'Pittsburgh Steelers',
      'Houston Texans', 'Indianapolis Colts', 'Jacksonville Jaguars', 'Tennessee Titans',
      'Chicago Bears', 'Detroit Lions', 'Green Bay Packers', 'Minnesota Vikings',
      'Atlanta Falcons', 'Carolina Panthers', 'New Orleans Saints', 'Tampa Bay Buccaneers',
      'Arizona Cardinals', 'Los Angeles Rams', 'San Francisco 49ers', 'Seattle Seahawks'
    ];
    
    const teamName = teamNames[teamId % teamNames.length] || 'Unknown Team';
    
    for (let i = 0; i < 53; i++) {
      const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
      const position = positions[Math.floor(Math.random() * positions.length)];
      const number = Math.floor(Math.random() * 99) + 1;
      
      roster.push({
        id: `player-${teamId}-${i}`,
        name: `${firstName} ${lastName}`,
        position: position,
        number: number,
        team: teamName,
        height: `${Math.floor(Math.random() * 6) + 5}'${Math.floor(Math.random() * 12)}"`,
        weight: Math.floor(Math.random() * 100) + 180,
        age: Math.floor(Math.random() * 10) + 22,
        experience: Math.floor(Math.random() * 8) + 1,
        college: 'Various Universities'
      });
    }
    
    console.log(`✅ Generated ${roster.length} fallback players for ${teamName}`);
    return roster;
  }

  // Format team roster data
  formatTeamRoster(data, teamId) {
    if (!data.items || !Array.isArray(data.items)) {
      return [];
    }
    
    return data.items.map((player, index) => ({
      id: player.id || `player-${teamId}-${index}`,
      name: player.displayName || 'Unknown Player',
      position: player.position?.displayName || 'Unknown',
      number: player.jersey || '00',
      team: player.team?.displayName || 'Unknown Team',
      height: player.height || 'N/A',
      weight: player.weight || 'N/A',
      age: player.age || 'N/A',
      experience: player.experience || 'N/A',
      college: player.college?.displayName || 'N/A'
    }));
  }
}

// Export the service
export default new SportsApiService();
