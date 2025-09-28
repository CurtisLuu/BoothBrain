import React, { useState, useEffect, useRef } from 'react';
import { BarChart3, Star, Play, TrendingUp } from 'lucide-react';

const RadialMenu = ({ isOpen, position, onClose, onOptionSelect, game, isHolding = false }) => {
  const menuRef = useRef(null);

  const options = [
    {
      id: 'summary',
      label: 'Game Summary',
      icon: BarChart3,
      color: 'bg-blue-500',
      hoverColor: 'bg-blue-600'
    },
    {
      id: 'players',
      label: 'Standout Players',
      icon: Star,
      color: 'bg-yellow-500',
      hoverColor: 'bg-yellow-600'
    },
    {
      id: 'highlights',
      label: 'Highlights',
      icon: Play,
      color: 'bg-green-500',
      hoverColor: 'bg-green-600'
    },
    {
      id: 'stats',
      label: 'Stats',
      icon: TrendingUp,
      color: 'bg-purple-500',
      hoverColor: 'bg-purple-600'
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

  const handleOptionClick = (optionId) => {
    console.log('RadialMenu handleOptionClick - optionId:', optionId);
    console.log('RadialMenu handleOptionClick - game:', game);
    
    // Safety check before calling onOptionSelect
    if (!game || typeof game !== 'object' || !game.awayTeam || !game.homeTeam) {
      console.warn('RadialMenu: Invalid game object, not calling onOptionSelect');
      onClose();
      return;
    }
    
    // Call the parent handler
    if (onOptionSelect && typeof onOptionSelect === 'function') {
      onOptionSelect(optionId, game);
    }
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
        left: `${position.x - 100}px`,
        top: `${position.y - 100}px`,
      }}
    >
      <div className="relative w-48 h-48">
        {/* Central circle */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 ${
            isHolding 
              ? 'bg-blue-600 dark:bg-blue-400 animate-pulse' 
              : 'bg-gray-800 dark:bg-gray-200'
          }`}>
            <span className="text-white dark:text-gray-800 text-xs font-medium">
              {isHolding ? 'HOLD' : getTeamInitial()}
            </span>
          </div>
        </div>

        {/* Menu options positioned in a circle */}
        {options.map((option, index) => {
          const angle = (index * 90) - 45; // Start at -45 degrees, space 90 degrees apart
          const radians = (angle * Math.PI) / 180;
          const radius = 60; // Distance from center
          const x = Math.cos(radians) * radius;
          const y = Math.sin(radians) * radius;

          const IconComponent = option.icon;

          return (
            <div
              key={option.id}
              className="absolute transform -translate-x-1/2 -translate-y-1/2"
              style={{
                left: `calc(50% + ${x}px)`,
                top: `calc(50% + ${y}px)`,
              }}
            >
              <button
                onClick={() => handleOptionClick(option.id)}
                className={`
                  w-12 h-12 rounded-full ${option.color} hover:${option.hoverColor}
                  flex items-center justify-center text-white shadow-lg
                  transition-all duration-200 transform hover:scale-110
                  group relative
                `}
                title={option.label}
              >
                <IconComponent className="w-5 h-5" />
                
                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                  {option.label}
                </div>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RadialMenu;