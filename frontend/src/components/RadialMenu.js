import React, { useState, useEffect, useRef } from 'react';
import { BarChart3, Star, Play, TrendingUp } from 'lucide-react';
import chatApi from '../services/chatApi';

const RadialMenu = ({ isOpen, position, onClose, onOptionSelect, game, isHolding = false }) => {
  const menuRef = useRef(null);
  const [hoveredOption, setHoveredOption] = useState(null);

  const options = [
    {
      id: 'summary',
      label: 'Game Summary',
      description: 'View overall game statistics and team performance',
      icon: BarChart3,
      color: '#EC4899', // Pink
      hoverColor: '#DB2777'
    },
    {
      id: 'players',
      label: 'Standout Players',
      description: 'See top performing players and key contributors',
      icon: Star,
      color: '#8B5CF6', // Purple
      hoverColor: '#7C3AED'
    },
    {
      id: 'highlights',
      label: 'Highlights',
      description: 'Watch key plays and memorable moments',
      icon: Play,
      color: '#F59E0B', // Amber
      hoverColor: '#D97706'
    },
    {
      id: 'stats',
      label: 'Stats',
      description: 'Detailed team and player statistics breakdown',
      icon: TrendingUp,
      color: '#06B6D4', // Cyan
      hoverColor: '#0891B2'
    }
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      // In hold mode, don't close on outside clicks - only on mouse up
      if (!isHolding && menuRef.current && !menuRef.current.contains(event.target)) {
        onClose();
      }
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      // Only add click outside listener if not in hold mode
      if (!isHolding) {
        document.addEventListener('mousedown', handleClickOutside);
      }
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose, isHolding]);

  // Safety check - don't render if not open
  if (!isOpen) return null;

  // Safety check - ensure game object is valid
  if (!game || typeof game !== 'object') {
    console.warn('RadialMenu: Invalid game object, not rendering');
    return null;
  }

  const sendChatPrompt = async (optionId, game) => {
    try {
      // Get or create session ID
      let sessionId = localStorage.getItem('cedar-chat-session');
      if (!sessionId) {
        const sessionData = await chatApi.createSession();
        sessionId = sessionData.sessionId;
        localStorage.setItem('cedar-chat-session', sessionId);
      }

      // Generate specific prompts based on the option
      let prompt = '';
      const gameInfo = `${game.awayTeam} vs ${game.homeTeam}`;
      
      switch (optionId) {
        case 'summary':
          prompt = `As a professional collegiate and NFL analyst, provide a comprehensive game summary for ${gameInfo} from the current season only. Use Google search to find the latest game statistics, team performance analysis, key moments, and overall game flow from this season's games. Include score updates, possession stats, and any notable events that shaped the outcome. Provide expert analysis with professional insights on strategy, execution, and game-changing moments. Focus specifically on current season data and avoid referencing previous seasons.`;
          break;
        case 'players':
          prompt = `As a professional collegiate and NFL analyst, analyze the standout players from ${gameInfo} from the current season only. Use Google search to find current season player statistics, performance metrics, and public opinion on key contributors from this season's games. Identify the top performers on both teams and explain why they were crucial to their team's performance. Provide expert analysis on player development, skill sets, and impact on the game. Focus specifically on current season data and avoid referencing previous seasons.`;
          break;
        case 'highlights':
          prompt = `As a professional collegiate and NFL analyst, find and describe the game-changing plays and highlights from ${gameInfo} from the current season only. Use Google search to locate video highlights, key moments, spectacular plays, and turning points that defined this game from this season. Focus on the most impactful and memorable moments from the current season. Provide expert analysis on the significance of these plays, their impact on the game's outcome, and what they reveal about team strategy and execution. Avoid referencing previous seasons.`;
          break;
        case 'stats':
          prompt = `As a professional collegiate and NFL analyst, provide detailed statistical analysis for ${gameInfo} from the current season only. Use Google search to gather comprehensive team and player statistics including offensive/defensive metrics, individual player performances, team comparisons, and advanced analytics that tell the story of this game from the current season. Provide expert insights on what these statistics reveal about team performance, coaching decisions, and game strategy. Focus specifically on current season data and avoid referencing previous seasons.`;
          break;
        default:
          prompt = `Please provide information about ${gameInfo}.`;
      }

      // Trigger chat expansion by dispatching a custom event
      // The chat component will handle the API call through its queue system
      window.dispatchEvent(new CustomEvent('cedar-chat-expand', { 
        detail: { message: prompt, game: game } 
      }));
      
    } catch (error) {
      console.error('Error sending chat prompt:', error);
    }
  };

  const handleOptionClick = (optionId) => {
    console.log('RadialMenu handleOptionClick - optionId:', optionId);
    console.log('RadialMenu handleOptionClick - game:', game);
    
    // Safety check before calling onOptionSelect
    if (!game || typeof game !== 'object' || !game.awayTeam || !game.homeTeam) {
      console.warn('RadialMenu: Invalid game object, not calling onOptionSelect');
      onClose();
      return;
    }
    
    // Send the chat prompt asynchronously (non-blocking)
    sendChatPrompt(optionId, game);
    
    // Call the parent handler for any additional actions
    if (onOptionSelect && typeof onOptionSelect === 'function') {
      onOptionSelect(optionId, game);
    }
    
    // Close the menu immediately
    onClose();
  };

  // Safe team name extraction for display
  const getTeamInitial = () => {
    try {
      if (game && game.awayTeam && typeof game.awayTeam === 'string') {
        return game.awayTeam.split(' ').pop().charAt(0);
      }
    } catch (error) {
      console.warn('Error extracting team initial:', error);
    }
    return 'G';
  };

  return (
    <div
      ref={menuRef}
      className="fixed z-50 pointer-events-auto"
      style={{
        left: `${position.x - 80}px`,
        top: `${position.y - 80}px`,
      }}
    >
      <div className="relative w-64 h-64">
        {/* Central circle */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center shadow-xl transition-all duration-200 ${
            isHolding 
              ? 'bg-gradient-to-br from-pink-500 to-purple-600 animate-pulse' 
              : 'bg-white dark:bg-gray-100'
          }`}>
            <span className={`text-sm font-bold ${
              isHolding ? 'text-white' : 'text-gray-800 dark:text-gray-900'
            }`}>
              {isHolding ? 'HOLD' : getTeamInitial()}
            </span>
          </div>
        </div>

        {/* Circular ring with segments */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative w-48 h-48">
            {options.map((option, index) => {
              const angle = (index * 90) - 45; // Start at -45 degrees
              const radians = (angle * Math.PI) / 180;
              const radius = 70; // Distance from center (reduced from 100)
              const x = Math.cos(radians) * radius;
              const y = Math.sin(radians) * radius;

          const IconComponent = option.icon;

          return (
            <div
              key={option.id}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 group"
              style={{
                left: `calc(50% + ${x}px)`,
                top: `calc(50% + ${y}px)`,
              }}
            >
                  {/* Circular button */}
                  <button
                    onClick={() => handleOptionClick(option.id)}
                    onMouseEnter={() => setHoveredOption(option.id)}
                    onMouseLeave={() => setHoveredOption(null)}
                    className={`
                      w-12 h-12 rounded-full ${option.color} hover:${option.hoverColor}
                      flex items-center justify-center text-white shadow-lg
                      transition-all duration-300 transform hover:scale-110
                      border-2 border-white dark:border-gray-200
                    `}
                    style={{
                      background: `linear-gradient(135deg, ${option.color}, ${option.hoverColor})`,
                      boxShadow: `0 6px 12px ${option.color}40, 0 0 0 1px rgba(255,255,255,0.2)`
                    }}
                  >
                    <IconComponent className="w-5 h-5" />
                  </button>

                  {/* Hover tooltip */}
                  {hoveredOption === option.id && (
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1.5 bg-gray-900 dark:bg-gray-800 text-white text-xs rounded-lg shadow-xl whitespace-nowrap z-10">
                      <div className="font-semibold mb-0.5">{option.label}</div>
                      <div className="text-xs text-gray-300">{option.description}</div>
                      {/* Arrow pointing down */}
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-3 border-r-3 border-t-3 border-transparent border-t-gray-900 dark:border-t-gray-800"></div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};

export default RadialMenu;