import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import footballApi from '../services/footballApi';

const SearchContext = createContext();

export const useSearch = () => {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
};

export const SearchProvider = ({ children }) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [allGames, setAllGames] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load all games for search functionality
  const loadAllGames = async () => {
    try {
      setLoading(true);
      const [nflGames, ncaaGames] = await Promise.all([
        footballApi.getNFLGames(),
        footballApi.getNCAAGames()
      ]);
      
      const gamesWithLeague = [
        ...nflGames.map(game => ({ ...game, league: 'nfl' })),
        ...ncaaGames.map(game => ({ ...game, league: 'ncaa' }))
      ];
      
      setAllGames(gamesWithLeague);
    } catch (error) {
      console.error('Error loading games for search:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load games on mount
  useEffect(() => {
    loadAllGames();
  }, []);

  // Generate search suggestions
  const generateSuggestions = (query) => {
    if (!query || query.length < 2) {
      setSearchSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const teamNames = new Set();
    
    allGames.forEach(game => {
      if (game.homeTeam && game.homeTeam.toLowerCase().includes(query.toLowerCase())) {
        teamNames.add(game.homeTeam);
      }
      if (game.awayTeam && game.awayTeam.toLowerCase().includes(query.toLowerCase())) {
        teamNames.add(game.awayTeam);
      }
    });

    const suggestions = Array.from(teamNames).slice(0, 5);
    setSearchSuggestions(suggestions);
    setShowSuggestions(suggestions.length > 0);
  };

  // Handle search input change
  const handleSearchInputChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    generateSuggestions(value);
  };

  // Find team league from games data
  const findTeamLeague = (teamName) => {
    const game = allGames.find(game => 
      (game.homeTeam && game.homeTeam.toLowerCase().includes(teamName.toLowerCase())) ||
      (game.awayTeam && game.awayTeam.toLowerCase().includes(teamName.toLowerCase()))
    );
    return game ? game.league : 'nfl'; // Default to NFL if not found
  };

  // Handle suggestion click
  const handleSuggestionClick = (teamName) => {
    setSearchQuery(teamName);
    setShowSuggestions(false);
    const league = findTeamLeague(teamName);
    navigate('/team', { state: { team: { name: teamName, league } } });
  };

  // Handle search form submit (Enter key)
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowSuggestions(false);
      const league = findTeamLeague(searchQuery.trim());
      navigate('/team', { state: { team: { name: searchQuery.trim(), league } } });
    }
  };

  // Clear search
  const clearSearch = () => {
    setSearchQuery('');
    setSearchSuggestions([]);
    setShowSuggestions(false);
  };

  const value = {
    searchQuery,
    setSearchQuery,
    searchSuggestions,
    setSearchSuggestions,
    showSuggestions,
    setShowSuggestions,
    allGames,
    loading,
    generateSuggestions,
    handleSearchInputChange,
    handleSuggestionClick,
    handleSearch,
    clearSearch,
    findTeamLeague,
    loadAllGames
  };

  return (
    <SearchContext.Provider value={value}>
      {children}
    </SearchContext.Provider>
  );
};
