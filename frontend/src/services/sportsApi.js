// Real sports data service using ESPN API and other sources
class SportsApiService {
  constructor() {
    // Use the correct ESPN API endpoints based on the documentation
    this.apiBaseUrl = 'http://localhost:8000';
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

  // Clear expired cache entries
  clearExpiredCache() {
    const now = Date.now();
    let clearedCount = 0;
    
    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp > this.cacheTimeout) {
        this.cache.delete(key);
        clearedCount++;
      }
    }
    
    if (clearedCount > 0) {
      console.log(`🧹 Cleared ${clearedCount} expired cache entries`);
    }
    
    return clearedCount;
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
      
      const isHome = Math.random() > 0.5;
      const opponent = opponents[Math.floor(Math.random() * opponents.length)];
      
      const homeScore = Math.floor(Math.random() * 35) + 10;
      const awayScore = Math.floor(Math.random() * 35) + 10;
      
      mockGames.push({
        id: `mock-${teamName}-${i}`,
        homeTeam: isHome ? teamName : opponent,
        awayTeam: isHome ? opponent : teamName,
        homeScore,
        awayScore,
        status: 'Final',
        time: '1:00 PM ET',
        date: gameDate.toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric'
        }),
        week: `Week ${9 - i}`,
        league,
        opponent,
        isHome
      });
    }
    
    // Generate future games (next 4 weeks)
    for (let i = 1; i <= 4; i++) {
      const gameDate = new Date(currentDate);
      gameDate.setDate(gameDate.getDate() + (i * 7));
      
      const isHome = Math.random() > 0.5;
      const opponent = opponents[Math.floor(Math.random() * opponents.length)];
      
      mockGames.push({
        id: `mock-${teamName}-future-${i}`,
        homeTeam: isHome ? teamName : opponent,
        awayTeam: isHome ? opponent : teamName,
        homeScore: null,
        awayScore: null,
        status: 'Scheduled',
        time: '1:00 PM ET',
        date: gameDate.toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric'
        }),
        week: `Week ${8 + i}`,
        league,
        opponent,
        isHome
      });
    }
    
    console.log(`Generated ${mockGames.length} mock games for ${teamName}`);
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
        
        // Use the original ISO date for proper comparison, not the formatted date
        const originalDate = game.originalDate || game.date;
        const gameDate = new Date(originalDate);
        
        // Add team-specific information
        const isHome = game.homeTeam === teamName;
        const opponent = isHome ? game.awayTeam : game.homeTeam;
        
        const enhancedGame = {
          ...game,
          opponent,
          isHome,
          date: game.formattedDate || game.date, // Use formatted date for display
          originalDate: originalDate // Keep original date for sorting
        };
        
        // Debug date comparison
        console.log(`Date comparison for ${game.homeTeam} vs ${game.awayTeam}:`, {
          gameDate: gameDate.toISOString(),
          currentDate: currentDate.toISOString(),
          gameYear: gameDate.getFullYear(),
          currentYear: currentDate.getFullYear(),
          isPast: gameDate < currentDate
        });
        
        // Proper date comparison that handles year transitions
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
      
      // Check cache first for team ID
      // Skip caching - always fetch fresh team ID
      console.log(`Fetching fresh team ID for ${teamName} (caching disabled)`);
      
      // Skip caching - always fetch fresh teams list
      console.log(`Fetching fresh teams list for ${league} (caching disabled)`);
      
      // Use the correct core API endpoint for teams
      const baseUrl = league === 'nfl' 
        ? `${this.espnCoreUrl}/nfl/teams?pageSize=32`
        : `${this.espnCoreUrl}/college-football/teams?pageSize=130`;
      
      console.log(`API URL: ${baseUrl}`);
      
      const response = await fetch(baseUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      if (!response.ok) {
        console.error(`ESPN API error: ${response.status} ${response.statusText}`);
        throw new Error(`ESPN API error: ${response.status}`);
      }

      const data = await response.json();
      console.log(`ESPN teams API response for ${league}:`, data);
      
      // The core API returns teams in a different structure
      const teams = data.items || [];
      console.log(`Found ${teams.length} teams in ${league}`);
      
      if (teams.length === 0) {
        console.log('No teams found in API response');
        return null;
      }
      
      // Log first few teams for debugging
      console.log('First 5 teams:', teams.slice(0, 5).map(t => ({
        displayName: t.displayName,
        name: t.name,
        id: t.id
      })));
      
      // Try to find team by exact name match first
      let team = teams.find(t => 
        t.displayName?.toLowerCase() === teamName.toLowerCase() ||
        t.name?.toLowerCase() === teamName.toLowerCase()
      );

      console.log(`Exact match result:`, team ? `Found: ${team.displayName}` : 'No exact match');

      // If not found, try partial match
      if (!team) {
        team = teams.find(t => 
          t.displayName?.toLowerCase().includes(teamName.toLowerCase()) ||
          t.name?.toLowerCase().includes(teamName.toLowerCase())
        );
        console.log(`Partial match result:`, team ? `Found: ${team.displayName}` : 'No partial match');
      }

      if (team) {
        const teamId = team.id;
        console.log(`✅ Found team: ${team.displayName} with ID: ${teamId}`);
        
        // Caching disabled - returning fresh team ID
        console.log(`✅ Returning fresh team ID for ${teamName}`);
        
        return teamId;
      } else {
        console.log(`❌ Team "${teamName}" not found in ${league} teams list`);
        console.log('Available teams:', teams.map(t => t.displayName || t.name).slice(0, 10));
        return null;
      }
    } catch (error) {
      console.error(`Error finding team ID for ${teamName}:`, error);
      return null;
    }
  }

  // Format ESPN team game data - Updated for core API structure
  formatESPNTeamGame(event, teamName, league) {
    console.log(`Formatting game for ${teamName}:`, event);
    
    // Core API structure is different - events have competitions array
    const competition = event.competitions?.[0];
    const competitors = competition?.competitors || [];
    
    console.log('Competition:', competition);
    console.log('Competitors:', competitors);
    
    // Find home and away teams
    const homeTeam = competitors.find(c => c.homeAway === 'home');
    const awayTeam = competitors.find(c => c.homeAway === 'away');
    
    if (!homeTeam || !awayTeam) {
      console.log('Missing home or away team data');
      return null;
    }

    const homeTeamName = homeTeam.team?.displayName || homeTeam.team?.name;
    const awayTeamName = awayTeam.team?.displayName || awayTeam.team?.name;
    
    console.log(`Home: ${homeTeamName}, Away: ${awayTeamName}`);
    console.log('Home team data:', homeTeam);
    console.log('Away team data:', awayTeam);
    
    // Determine if our team is home or away
    const isHome = homeTeamName === teamName;
    const opponent = isHome ? awayTeamName : homeTeamName;
    
    // Get scores - core API has scores in different location
    const homeScore = homeTeam.score ? parseInt(homeTeam.score) : 
                     (homeTeam.statistics?.[0]?.stats?.find(s => s.label === 'Points')?.value ? 
                      parseInt(homeTeam.statistics[0].stats.find(s => s.label === 'Points').value) : null);
    const awayScore = awayTeam.score ? parseInt(awayTeam.score) : 
                     (awayTeam.statistics?.[0]?.stats?.find(s => s.label === 'Points')?.value ? 
                      parseInt(awayTeam.statistics[0].stats.find(s => s.label === 'Points').value) : null);
    
    console.log(`Scores - Home: ${homeScore}, Away: ${awayScore}`);
    
    // Determine game status
    let status = 'Scheduled';
    if (event.status?.type?.completed) {
      status = 'Final';
    } else if (event.status?.type?.inProgress) {
      status = 'Live';
    } else if (event.status?.type?.name === 'STATUS_FINAL') {
      status = 'Final';
    } else if (event.status?.type?.name === 'STATUS_IN_PROGRESS') {
      status = 'Live';
    }

    // Format date
    const gameDate = new Date(event.date);
    const formattedDate = gameDate.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });

    // Get week number
    const week = event.week?.number || event.season?.week || 1;

    return {
      id: event.id,
      homeTeam: homeTeamName,
      awayTeam: awayTeamName,
      homeScore,
      awayScore,
      status,
      time: event.status?.type?.shortDetail || event.status?.type?.detail || 'TBD',
      date: formattedDate,
      week: `Week ${week}`,
      league,
      opponent,
      isHome
    };
  }

  // Get NFL games from ESPN API - Enhanced with caching
  async getNFLGames() {
    try {
      console.log('=== FETCHING NFL GAMES WITH CACHING ===');
      
      // Skip caching - always fetch fresh data
      console.log('Fetching fresh NFL games (caching disabled)');
      
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
        console.error(`ESPN API error: ${response.status} ${response.statusText}`);
        throw new Error(`ESPN API error: ${response.status}`);
      }

      const data = await response.json();
      console.log('ESPN NFL API response structure:', {
        hasEvents: !!data.events,
        eventsLength: data.events?.length || 0,
        hasSports: !!data.sports,
        sportsLength: data.sports?.length || 0,
        keys: Object.keys(data),
        week: data.week
      });
      
      // Try different data structures
      let events = data.events || [];
      if (events.length === 0 && data.sports && data.sports[0] && data.sports[0].leagues) {
        events = data.sports[0].leagues[0].events || [];
        console.log('Using alternative data structure, found events:', events.length);
      }
      
      console.log(`Found ${events.length} events in API response`);
      
      const formattedGames = this.formatESPNGames(events, 'nfl');
      console.log(`Formatted ${formattedGames.length} NFL games`);
      console.log('Sample formatted game:', formattedGames[0]);
      
      // Caching disabled - returning fresh data
      console.log('✅ Returning fresh NFL games');
      
      return formattedGames;
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

  // Get NFL games by specific week - Enhanced with caching
  async getNFLGamesByWeek(week) {
    try {
      console.log(`=== FETCHING NFL WEEK ${week} WITH CACHING ===`);
      
      // Skip caching - always fetch fresh data
      console.log(`Fetching fresh NFL games for week ${week} (caching disabled)`);
      
      const weekUrl = `${this.nflUrl}?week=${week}`;
      console.log(`API URL: ${weekUrl}`);
      
      const response = await fetch(weekUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      if (!response.ok) {
        console.error(`ESPN API error: ${response.status} ${response.statusText}`);
        throw new Error(`ESPN API error: ${response.status}`);
      }

      const data = await response.json();
      console.log(`ESPN NFL Week ${week} API response:`, data);
      console.log(`Week ${week} NFL events found:`, data.events ? data.events.length : 0);
      console.log(`NFL Week ${week} API URL used:`, weekUrl);
      console.log(`NFL Week ${week} info:`, data.week);
      
      const formattedGames = this.formatESPNGames(data.events || [], 'nfl');
      
      // Caching disabled - returning fresh data
      console.log(`✅ Returning fresh NFL games for week ${week}`);
      
      return formattedGames;
    } catch (error) {
      console.error(`Error fetching NFL games for week ${week} from ESPN:`, error);
      return [];
    }
  }

  // Get team statistics for a specific team - Enhanced with comprehensive stats and caching
  async getTeamStats(teamName, league) {
    try {
      console.log(`=== FETCHING TEAM STATS WITH CACHING ===`);
      console.log(`Team: ${teamName}, League: ${league}`);
      
      // Skip caching - always fetch fresh team stats
      console.log(`Fetching fresh team stats for ${teamName} (caching disabled)`);
      
      console.log(`Cache miss for ${teamName}, fetching fresh data...`);
      
      // Get team games first to calculate stats from actual game data
      const { pastGames, futureGames } = await this.getTeamGames(teamName, league);
      const allGames = [...pastGames, ...futureGames];
      
      if (allGames.length === 0) {
        console.log(`No games found for ${teamName}, cannot calculate stats`);
        return null;
      }

      console.log(`Calculating stats from ${allGames.length} games for ${teamName}`);
      
      // Calculate comprehensive statistics from game data
      const stats = this.calculateComprehensiveTeamStats(allGames, teamName, league);
      
      // Try to get additional stats from ESPN API if available (with caching)
      try {
        const teamId = await this.findTeamId(teamName, league);
        if (teamId) {
          const apiStatsCacheKey = `team-api-stats-${teamId}-${league}`;
          let apiStats = this.getCachedData(apiStatsCacheKey);
          
          if (!apiStats) {
            console.log(`Fetching additional API stats for team ID ${teamId}...`);
            const teamStatsUrl = `https://site.api.espn.com/apis/site/v2/sports/football/${league}/teams/${teamId}/stats`;
            
            const response = await fetch(teamStatsUrl, {
              method: 'GET',
              headers: {
                'Accept': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
              }
            });

            if (response.ok) {
              const apiData = await response.json();
              console.log(`Additional API stats for ${teamName}:`, apiData);
              
              // Format and cache the API stats
              apiStats = this.formatTeamStats(apiData, teamName);
              if (apiStats) {
                this.setCachedData(apiStatsCacheKey, apiStats);
              }
            }
          } else {
            console.log(`✅ Using cached API stats for team ID ${teamId}`);
          }
          
          // Merge API stats with calculated stats
          if (apiStats) {
            const mergedStats = { ...stats, ...apiStats };
            console.log(`✅ Returning fresh merged stats for ${teamName}`);
            return mergedStats;
          }
        }
      } catch (error) {
        console.log(`Additional API stats failed for ${teamName}: ${error.message}`);
      }
      
      // Caching disabled - returning fresh stats
      console.log(`✅ Returning fresh calculated stats for ${teamName}`);
      
      return stats;
    } catch (error) {
      console.error(`Error fetching team stats for ${teamName}:`, error);
      return null;
    }
  }


  // Test function to debug ESPN API calls
  async testESPNConnection(teamName, league) {
    console.log('=== TESTING ESPN API CONNECTION ===');
    console.log(`Testing for team: ${teamName} in ${league}`);
    
    try {
      // Test 1: Try to get team ID
      console.log('Test 1: Finding team ID...');
      const teamId = await this.findTeamId(teamName, league);
      console.log('Team ID result:', teamId);
      
      // Test 2: Try to get current games
      console.log('Test 2: Getting current games...');
      const currentGames = league === 'nfl' ? await this.getNFLGames() : await this.getNCAAGames();
      console.log(`Found ${currentGames.length} current games`);
      console.log('Sample current game:', currentGames[0]);
      
      // Test 3: Try to find team in current games
      console.log('Test 3: Searching for team in current games...');
      const teamInCurrentGames = currentGames.filter(game => {
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
      console.log(`Found ${teamInCurrentGames.length} games for ${teamName} in current games`);
      console.log('Sample team game:', teamInCurrentGames[0]);
      
      // Test 4: Try the full getTeamGames method
      console.log('Test 4: Testing full getTeamGames method...');
      const teamGames = await this.getTeamGames(teamName, league);
      console.log('Full getTeamGames result:', teamGames);
      
      console.log('=== ESPN API TEST COMPLETE ===');
      return { teamId, currentGamesCount: currentGames.length, teamGamesCount: teamInCurrentGames.length, fullResult: teamGames };
      
    } catch (error) {
      console.error('ESPN API test failed:', error);
      return { error: error.message };
    }
  }

  // Calculate comprehensive team statistics from game data
  calculateComprehensiveTeamStats(games, teamName, league) {
    try {
      console.log(`Calculating comprehensive stats for ${teamName} from ${games.length} games`);
      
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
      let totalYards = 0;
      let totalYardsAllowed = 0;
      let turnovers = 0;
      let takeaways = 0;
      let penalties = 0;
      let penaltyYards = 0;
      let thirdDownConversions = 0;
      let thirdDownAttempts = 0;
      let redZoneAttempts = 0;
      let redZoneTouchdowns = 0;
      let timeOfPossession = 0;
      let sacks = 0;
      let interceptions = 0;
      let fumbles = 0;
      let fumblesRecovered = 0;
      let currentStreak = 0;
      let longestWinStreak = 0;
      let longestLossStreak = 0;
      let currentStreakType = '';

      // Calculate basic stats
      teamGames.forEach((game, index) => {
        if (game.status === 'Final') {
          const isHomeTeam = game.homeTeam === teamName;
          const teamScore = isHomeTeam ? game.homeScore : game.awayScore;
          const opponentScore = isHomeTeam ? game.awayScore : game.homeScore;

          totalPointsFor += teamScore || 0;
          totalPointsAgainst += opponentScore || 0;

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

      // Calculate streaks
      let currentStreakCount = 0;
      let currentStreakDirection = '';
      let maxWinStreak = 0;
      let maxLossStreak = 0;
      let tempWinStreak = 0;
      let tempLossStreak = 0;

      // Sort games by date for streak calculation
      const sortedGames = teamGames
        .filter(game => game.status === 'Final')
        .sort((a, b) => new Date(a.date) - new Date(b.date));

      sortedGames.forEach(game => {
        const isHomeTeam = game.homeTeam === teamName;
        const teamScore = isHomeTeam ? game.homeScore : game.awayScore;
        const opponentScore = isHomeTeam ? game.awayScore : game.homeScore;
        const won = teamScore > opponentScore;
        const lost = teamScore < opponentScore;

        if (won) {
          tempWinStreak++;
          tempLossStreak = 0;
          maxWinStreak = Math.max(maxWinStreak, tempWinStreak);
        } else if (lost) {
          tempLossStreak++;
          tempWinStreak = 0;
          maxLossStreak = Math.max(maxLossStreak, tempLossStreak);
        } else {
          tempWinStreak = 0;
          tempLossStreak = 0;
        }
      });

      // Calculate current streak (from most recent games)
      const recentGames = sortedGames.slice(-10).reverse(); // Last 10 games
      for (let i = 0; i < recentGames.length; i++) {
        const game = recentGames[i];
        const isHomeTeam = game.homeTeam === teamName;
        const teamScore = isHomeTeam ? game.homeScore : game.awayScore;
        const opponentScore = isHomeTeam ? game.awayScore : game.homeScore;
        const won = teamScore > opponentScore;
        const lost = teamScore < opponentScore;

        if (i === 0) {
          if (won) {
            currentStreakCount = 1;
            currentStreakDirection = 'W';
          } else if (lost) {
            currentStreakCount = 1;
            currentStreakDirection = 'L';
          }
        } else {
          if ((currentStreakDirection === 'W' && won) || (currentStreakDirection === 'L' && lost)) {
            currentStreakCount++;
          } else {
            break;
          }
        }
      }

      const totalGames = wins + losses + ties;
      const winPercentage = totalGames > 0 ? (wins / totalGames * 100).toFixed(1) : 0;
      const pointDifferential = totalPointsFor - totalPointsAgainst;
      const pointsPerGame = totalGames > 0 ? (totalPointsFor / totalGames).toFixed(1) : 0;
      const pointsAllowedPerGame = totalGames > 0 ? (totalPointsAgainst / totalGames).toFixed(1) : 0;

      return {
        teamName,
        season: new Date().getFullYear(),
        totalGames,
        wins,
        losses,
        ties,
        winPercentage: parseFloat(winPercentage),
        totalPointsFor,
        totalPointsAgainst,
        pointDifferential,
        pointsPerGame: parseFloat(pointsPerGame),
        pointsAllowedPerGame: parseFloat(pointsAllowedPerGame),
        homeGames,
        awayGames,
        homeWins,
        awayWins,
        homeWinPercentage: homeGames > 0 ? parseFloat((homeWins / homeGames * 100).toFixed(1)) : 0,
        awayWinPercentage: awayGames > 0 ? parseFloat((awayWins / awayGames * 100).toFixed(1)) : 0,
        currentStreak: currentStreakCount,
        currentStreakType: currentStreakDirection,
        longestWinStreak: maxWinStreak,
        longestLossStreak: maxLossStreak,
        // Advanced stats (would need more detailed game data)
        totalYards: 0,
        totalYardsAllowed: 0,
        yardsPerGame: 0,
        yardsAllowedPerGame: 0,
        turnovers: 0,
        takeaways: 0,
        turnoverDifferential: 0,
        penalties: 0,
        penaltyYards: 0,
        thirdDownConversionRate: 0,
        redZoneTouchdownRate: 0,
        timeOfPossessionPerGame: 0,
        sacks: 0,
        interceptions: 0,
        fumbles: 0,
        fumblesRecovered: 0,
        // Recent form (last 5 games)
        recentForm: this.calculateRecentForm(sortedGames.slice(-5), teamName),
        // Division/conference standings would need additional API calls
        divisionRank: 0,
        conferenceRank: 0
      };
    } catch (error) {
      console.error('Error calculating comprehensive team stats:', error);
      return null;
    }
  }

  // Calculate recent form (last 5 games)
  calculateRecentForm(recentGames, teamName) {
    if (recentGames.length === 0) return { wins: 0, losses: 0, ties: 0, form: '' };
    
    let wins = 0;
    let losses = 0;
    let ties = 0;
    
    recentGames.forEach(game => {
      const isHomeTeam = game.homeTeam === teamName;
      const teamScore = isHomeTeam ? game.homeScore : game.awayScore;
      const opponentScore = isHomeTeam ? game.awayScore : game.homeScore;
      
      if (teamScore > opponentScore) {
        wins++;
      } else if (teamScore < opponentScore) {
        losses++;
      } else {
        ties++;
      }
    });
    
    const form = recentGames.map(game => {
      const isHomeTeam = game.homeTeam === teamName;
      const teamScore = isHomeTeam ? game.homeScore : game.awayScore;
      const opponentScore = isHomeTeam ? game.awayScore : game.homeScore;
      
      if (teamScore > opponentScore) return 'W';
      if (teamScore < opponentScore) return 'L';
      return 'T';
    }).join('');
    
    return { wins, losses, ties, form };
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

    console.log(`=== FORMATTING ${events.length} ${league.toUpperCase()} GAMES ===`);
    console.log('Sample event:', events[0]);

    return events.map((event, index) => {
      const competition = event.competitions?.[0];
      const homeTeam = competition?.competitors?.find(team => team.homeAway === 'home');
      const awayTeam = competition?.competitors?.find(team => team.homeAway === 'away');
      
      console.log(`Game ${index + 1}:`, {
        eventId: event.id,
        homeTeam: homeTeam?.team?.displayName,
        awayTeam: awayTeam?.team?.displayName,
        homeScore: homeTeam?.score,
        awayScore: awayTeam?.score,
        status: competition?.status?.type?.name
      });
      
      const formattedGame = {
        id: event.id || index + 1,
        homeTeam: homeTeam?.team?.displayName || 'Home Team',
        awayTeam: awayTeam?.team?.displayName || 'Away Team',
        homeScore: parseInt(homeTeam?.score) || 0,
        awayScore: parseInt(awayTeam?.score) || 0,
        status: this.getGameStatus(competition?.status?.type?.name),
        time: this.formatGameTime(event.date), // Keep time internally for sorting
        date: event.date, // Keep original date for sorting
        formattedDate: this.formatGameDate(event.date), // Formatted date for display
        week: this.getWeekNumber(event.date, league),
        league: league
      };
      
      console.log(`Formatted game ${index + 1}:`, formattedGame);
      
      return formattedGame;
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

