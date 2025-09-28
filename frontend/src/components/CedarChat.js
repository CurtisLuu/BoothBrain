import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Send, ChevronUp, Trash2, X, Copy, RotateCcw, ThumbsUp, ThumbsDown, Maximize2, Minimize2 } from 'lucide-react';
import { useDarkMode } from '../contexts/DarkModeContext';
import chatApi from '../services/chatApi';

const CedarChat = () => {
  const { isDarkMode } = useDarkMode();
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [chatHeight, setChatHeight] = useState(500);
  const [chatWidth, setChatWidth] = useState(560); // Smaller default size
  const [isResizing, setIsResizing] = useState(false);
  const [resizeType, setResizeType] = useState(null); // 'se', 'sw', 'ne', 'nw'
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const chatContainerRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when expanded and set initial position
  useEffect(() => {
    if (isExpanded && inputRef.current) {
      inputRef.current.focus();
      // Position the chatbox at the bottom of the screen
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const initialX = (viewportWidth - chatWidth) / 2;
      const finalY = viewportHeight - chatHeight - 20;
      
      // Set position immediately
      setPosition({
        x: Math.max(0, initialX),
        y: Math.max(0, finalY)
      });
    }
  }, [isExpanded, chatWidth, chatHeight]);

  // Create or get session ID
  useEffect(() => {
    const storedSessionId = localStorage.getItem('cedar-chat-session');
    if (storedSessionId) {
      setSessionId(storedSessionId);
    } else {
      createNewSession();
    }
  }, []);

  // Resize functionality
  const handleResizeMove = useCallback((e) => {
    if (!isResizing || !resizeType) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    requestAnimationFrame(() => {
      const container = chatContainerRef.current;
      if (!container) return;
      
      const rect = container.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      
      let newWidth = chatWidth;
      let newHeight = chatHeight;
      let newX = position.x;
      let newY = position.y;
      
      // Calculate new dimensions and position based on resize type
      switch (resizeType) {
        case 'se': // Southeast (bottom-right)
          newWidth = Math.max(400, Math.min(1200, e.clientX - rect.left));
          newHeight = Math.max(300, Math.min(800, e.clientY - rect.top));
          // Position stays the same for SE resize
          break;
        case 'sw': // Southwest (bottom-left)
          newWidth = Math.max(400, Math.min(1200, rect.right - e.clientX));
          newHeight = Math.max(300, Math.min(800, e.clientY - rect.top));
          // Adjust X position to keep right edge in place
          newX = e.clientX;
          break;
        case 'ne': // Northeast (top-right)
          newWidth = Math.max(400, Math.min(1200, e.clientX - rect.left));
          newHeight = Math.max(300, Math.min(800, rect.bottom - e.clientY));
          // Adjust Y position to keep bottom edge in place
          newY = e.clientY;
          break;
        case 'nw': // Northwest (top-left)
          newWidth = Math.max(400, Math.min(1200, rect.right - e.clientX));
          newHeight = Math.max(300, Math.min(800, rect.bottom - e.clientY));
          // Adjust both X and Y position to keep bottom-right corner in place
          newX = e.clientX;
          newY = e.clientY;
          break;
      }
      
      // Ensure position stays within viewport bounds
      const maxX = viewportWidth - newWidth;
      const maxY = viewportHeight - newHeight;
      
      const boundedX = Math.max(0, Math.min(newX, maxX));
      const boundedY = Math.max(0, Math.min(newY, maxY));
      
      setChatWidth(newWidth);
      setChatHeight(newHeight);
      setPosition({ x: boundedX, y: boundedY });
    });
  }, [isResizing, resizeType, chatWidth, chatHeight, position]);

  const handleResizeEnd = useCallback(() => {
    setIsResizing(false);
    setResizeType(null);
  }, []);

  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleResizeMove);
      document.addEventListener('mouseup', handleResizeEnd);
    }

    return () => {
      document.removeEventListener('mousemove', handleResizeMove);
      document.removeEventListener('mouseup', handleResizeEnd);
    };
  }, [isResizing, handleResizeMove, handleResizeEnd]);

  const createNewSession = async () => {
    try {
      const data = await chatApi.createSession();
      setSessionId(data.session_id);
      localStorage.setItem('cedar-chat-session', data.session_id);
    } catch (error) {
      console.error('Error creating session:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const data = await chatApi.sendMessage(userMessage.content, sessionId, 'general');
      console.log('API Response:', data); // Debug log
      
      const assistantMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: data.answer || data.message || 'No response received',
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: "I'm sorry, I'm having trouble connecting right now. Please try again later.",
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearChat = async () => {
    if (!sessionId) return;
    
    // Confirm before clearing
    if (!window.confirm('Are you sure you want to delete this conversation? This action cannot be undone.')) {
      return;
    }
    
    try {
      await chatApi.clearChat(sessionId);
      setMessages([]);
      setInputValue(''); // Clear input as well
      console.log('Chat cleared successfully');
    } catch (error) {
      console.error('Error clearing chat:', error);
      // Still clear locally even if backend fails
      setMessages([]);
      setInputValue('');
    }
  };

  const copyMessage = (content) => {
    navigator.clipboard.writeText(content);
  };

  // Drag functionality with performance optimizations
  const handleDragStart = useCallback((e) => {
    if (e.target.closest('button') || e.target.closest('input')) return; // Don't drag if clicking on interactive elements
    e.preventDefault();
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  }, [position]);

  const handleDragMove = useCallback((e) => {
    if (!isDragging) return;
    e.preventDefault();
    
    requestAnimationFrame(() => {
      const newX = e.clientX - dragStart.x;
      const newY = e.clientY - dragStart.y;
      
      // Keep within viewport bounds
      const maxX = window.innerWidth - chatWidth;
      const maxY = window.innerHeight - chatHeight;
      
      setPosition({
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY))
      });
    });
  }, [isDragging, dragStart, chatWidth, chatHeight]);

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Add event listeners for dragging
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleDragMove);
      document.addEventListener('mouseup', handleDragEnd);
      return () => {
        document.removeEventListener('mousemove', handleDragMove);
        document.removeEventListener('mouseup', handleDragEnd);
      };
    }
  }, [isDragging, dragStart, chatWidth, chatHeight]);

  const formatMessageContent = (content) => {
    if (!content) return '';
    
    // Clean up the content first - remove unnecessary asterisks and formatting artifacts
    let cleanedContent = content
      .replace(/\*\*\s*\*\*/g, '') // Remove empty bold markers
      .replace(/\*\s*\*/g, '') // Remove empty italic markers
      .replace(/\*\*\*\s*\*\*\*/g, '') // Remove empty bold-italic markers
      .replace(/\*\*\s*([^*]+)\s*\*\*/g, '**$1**') // Clean up bold text (remove extra spaces)
      .replace(/\*\s*([^*]+)\s*\*/g, '*$1*') // Clean up italic text (remove extra spaces)
      .replace(/\n\s*\*\s*\n/g, '\n\n') // Remove standalone asterisks on their own lines
      .replace(/\n\s*\*\s+/g, '\n• ') // Convert asterisk bullets to proper bullets
      .replace(/^\s*\*\s+/gm, '• ') // Convert asterisk bullets at start of lines
      .trim();
    
    // Split content into lines and process each line
    const lines = cleanedContent.split('\n');
    const formattedLines = lines.map((line, index) => {
      const trimmedLine = line.trim();
      
      // Handle different types of content
      if (trimmedLine.startsWith('**') && trimmedLine.endsWith('**') && trimmedLine.length > 4) {
        // Bold text
        return <div key={index} className="font-bold text-lg mb-2 mt-3 text-blue-400">{trimmedLine.slice(2, -2)}</div>;
      } else if (trimmedLine.startsWith('*') && trimmedLine.endsWith('*') && trimmedLine.length > 2 && !trimmedLine.startsWith('**')) {
        // Italic text
        return <div key={index} className="italic text-gray-300 mb-1">{trimmedLine.slice(1, -1)}</div>;
      } else if (trimmedLine.startsWith('#')) {
        // Headers
        const level = trimmedLine.match(/^#+/)[0].length;
        const text = trimmedLine.replace(/^#+\s*/, '');
        const className = level === 1 ? 'text-xl font-bold text-blue-400 mb-3 mt-4' :
                         level === 2 ? 'text-lg font-semibold text-blue-300 mb-2 mt-3' :
                         'text-base font-medium text-blue-200 mb-1 mt-2';
        return <div key={index} className={className}>{text}</div>;
      } else if (trimmedLine.startsWith('- ') || trimmedLine.startsWith('• ')) {
        // Bullet points
        return <div key={index} className="ml-4 mb-1 text-gray-200">• {trimmedLine.slice(2)}</div>;
      } else if (trimmedLine.match(/^\d+\.\s/)) {
        // Numbered lists
        return <div key={index} className="ml-4 mb-1 text-gray-200">{trimmedLine}</div>;
      } else if (trimmedLine.startsWith('```')) {
        // Code blocks (simplified handling)
        return <div key={index} className="bg-gray-900 p-3 rounded-lg font-mono text-sm text-blue-300 my-2 border border-gray-600">{trimmedLine}</div>;
      } else if (trimmedLine.startsWith('`') && trimmedLine.endsWith('`')) {
        // Inline code
        return <span key={index} className="bg-gray-700 px-2 py-1 rounded font-mono text-sm text-blue-300">{trimmedLine.slice(1, -1)}</span>;
      } else if (trimmedLine === '') {
        // Empty lines for spacing
        return <div key={index} className="h-2"></div>;
      } else if (trimmedLine === '*' || trimmedLine === '**' || trimmedLine === '***') {
        // Skip standalone asterisks
        return null;
      } else {
        // Regular text
        return <div key={index} className="text-gray-100 mb-2 leading-relaxed">{trimmedLine}</div>;
      }
    }).filter(Boolean); // Remove null entries
    
    return formattedLines;
  };

  const handleResizeStart = useCallback((e, type) => {
    e.preventDefault();
    setIsResizing(true);
    setResizeType(type);
  }, []);

  const resetSize = () => {
    setChatWidth(560);
    setChatHeight(500);
  };

  const maximizeSize = () => {
    setChatWidth(1200);
    setChatHeight(800);
  };

  return (
    <>
      {/* Custom scrollbar styles */}
      <style jsx>{`
        .cedar-chat-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .cedar-chat-scrollbar::-webkit-scrollbar-track {
          background: #1F2937;
          border-radius: 4px;
        }
        .cedar-chat-scrollbar::-webkit-scrollbar-thumb {
          background: #4B5563;
          border-radius: 4px;
          transition: background 0.2s ease;
        }
        .cedar-chat-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #6B7280;
        }
        .cedar-chat-scrollbar::-webkit-scrollbar-thumb:active {
          background: #9CA3AF;
        }
        
        /* Enhanced text readability */
        .cedar-chat-message {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
          line-height: 1.6;
          letter-spacing: 0.01em;
        }
        
        /* Better contrast for readability */
        .cedar-chat-message strong {
          color: #10B981;
          font-weight: 600;
        }
        
        .cedar-chat-message code {
          background-color: #374151;
          color: #34D399;
          padding: 0.125rem 0.25rem;
          border-radius: 0.25rem;
          font-size: 0.875rem;
          font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
        }
        
        .cedar-chat-message pre {
          background-color: #111827;
          color: #34D399;
          padding: 1rem;
          border-radius: 0.5rem;
          border: 1px solid #374151;
          overflow-x: auto;
          font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
        }
      `}</style>
      
      <div 
        className={`fixed z-50 transition-all duration-300 ${
          isExpanded 
            ? 'cursor-move' 
            : 'bottom-4 left-1/2 transform -translate-x-1/2 w-full px-4 max-w-xs'
        }`}
        style={isExpanded ? {
          left: position.x,
          top: position.y,
          transform: 'none',
          willChange: isDragging || isResizing ? 'transform' : 'auto'
        } : {}}
        onMouseDown={isExpanded ? handleDragStart : undefined}
      >
      {/* Chat Container */}
      <div 
        ref={chatContainerRef}
        className={`${isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300'} rounded-2xl border transition-all duration-300 relative shadow-lg ${
          isExpanded ? 'flex flex-col' : 'h-10'
        }`}
        style={isExpanded ? { 
          width: `${chatWidth}px`, 
          height: `${chatHeight}px`,
          maxWidth: '90vw',
          maxHeight: '90vh',
          boxShadow: '0 0 8px rgba(59, 130, 246, 0.15), 0 0 16px rgba(59, 130, 246, 0.08)'
        } : {
          boxShadow: '0 0 8px rgba(59, 130, 246, 0.15), 0 0 16px rgba(59, 130, 246, 0.08)'
        }}
      >
        
        {/* Chat Header - Only shown when expanded */}
        {isExpanded && (
          <div 
            className={`flex items-center justify-between p-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} cursor-move select-none`}
            onMouseDown={handleDragStart}
          >
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              </div>
              <span className={`${isDarkMode ? 'text-white' : 'text-gray-900'} font-medium`}>AI Sports Analyst Assistant</span>
              <div className="flex space-x-1 ml-2">
                <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={resetSize}
                className={`p-1 ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} rounded-full transition-colors`}
                aria-label="Reset size"
              >
                <Minimize2 className={`w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
              </button>
              <button
                onClick={maximizeSize}
                className={`p-1 ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} rounded-full transition-colors`}
                aria-label="Maximize size"
              >
                <Maximize2 className={`w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
              </button>
              <button
                onClick={clearChat}
                className={`p-1 ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} rounded-full transition-colors`}
                aria-label="Clear chat"
              >
                <Trash2 className={`w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
              </button>
              <button
                onClick={() => setIsExpanded(false)}
                className={`p-1 ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} rounded-full transition-colors`}
                aria-label="Close"
              >
                <X className={`w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
              </button>
            </div>
          </div>
        )}

        {/* Messages Area - Only shown when expanded */}
        {isExpanded && (
          <div 
            className="flex-1 overflow-y-auto p-4 space-y-4 cedar-chat-scrollbar" 
            style={{ 
              scrollbarWidth: 'thin',
              scrollbarColor: isDarkMode ? '#4B5563 #1F2937' : '#D1D5DB #F3F4F6'
            }}
          >
            {messages.map((message) => (
              <div key={message.id} className="space-y-2">
                {/* User Message */}
                {message.role === 'user' && (
                  <div className="flex justify-end">
                    <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-blue-500'} rounded-2xl px-4 py-2 max-w-[80%]`}>
                      <p className="text-white text-sm">{message.content}</p>
                    </div>
                  </div>
                )}

                {/* Assistant Message */}
                {message.role === 'assistant' && (
                  <div className="space-y-2">
                    {/* Assistant Response */}
                    <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'} rounded-2xl px-6 py-4 shadow-lg`}>
                      <div className="prose prose-invert prose-sm max-w-none cedar-chat-message">
                        <div className={`${isDarkMode ? 'text-white' : 'text-gray-900'} leading-relaxed whitespace-pre-wrap break-words`}>
                          {formatMessageContent(message.content)}
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center space-x-3 text-gray-400 ml-2">
                      <button className="hover:text-white transition-colors" title="Helpful">
                        <ThumbsUp className="w-4 h-4" />
                      </button>
                      <button className="hover:text-white transition-colors" title="Not helpful">
                        <ThumbsDown className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => copyMessage(message.content)}
                        className="hover:text-white transition-colors"
                        title="Copy message"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button className="hover:text-white transition-colors" title="Regenerate">
                        <RotateCcw className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Loading State */}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-800 dark:bg-gray-700 rounded-2xl px-4 py-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}

        {/* Input Area - Different layout for collapsed vs expanded */}
        {!isExpanded ? (
          // Collapsed state - slim input bar
          <div className="px-3 py-2 h-full">
            <div className="flex items-center space-x-2 h-full">
              <div className="flex-1 relative h-full flex items-center">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  onFocus={() => !isExpanded && setIsExpanded(true)}
                  placeholder="Ask a question..."
                  className={`w-full bg-transparent border-none ${isDarkMode ? 'text-white placeholder-gray-400' : 'text-gray-900 placeholder-gray-500'} focus:outline-none text-sm h-full flex items-center`}
                  style={{
                    boxShadow: 'inset 0 0 4px rgba(59, 130, 246, 0.1)'
                  }}
                  disabled={isLoading}
                />
              </div>
              
              {/* Send Button */}
              <button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isLoading}
                className="p-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-full transition-colors shadow-sm"
                style={{
                  boxShadow: '0 0 6px rgba(59, 130, 246, 0.2)'
                }}
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          // Expanded state - input at bottom
          <div className={`px-3 py-2 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} mt-auto`}>
            <div className="flex items-center space-x-2">
              <div className="flex-1 relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask a question..."
                  className={`w-full bg-transparent border-none ${isDarkMode ? 'text-white placeholder-gray-400' : 'text-gray-900 placeholder-gray-500'} focus:outline-none text-sm h-full flex items-center`}
                  style={{
                    boxShadow: 'inset 0 0 4px rgba(59, 130, 246, 0.1)'
                  }}
                  disabled={isLoading}
                />
              </div>
              
              {/* Send Button */}
              <button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isLoading}
                className="p-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-full transition-colors shadow-sm"
                style={{
                  boxShadow: '0 0 6px rgba(59, 130, 246, 0.2)'
                }}
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Resize Handles - Only shown when expanded */}
        {isExpanded && (
          <>
            {/* Top-left corner */}
            <div
              className="absolute top-0 left-0 w-3 h-3 cursor-nw-resize"
              onMouseDown={(e) => handleResizeStart(e, 'nw')}
              title="Drag to resize"
            />
            
            {/* Top-right corner */}
            <div
              className="absolute top-0 right-0 w-3 h-3 cursor-ne-resize"
              onMouseDown={(e) => handleResizeStart(e, 'ne')}
              title="Drag to resize"
            />
            
            {/* Bottom-left corner */}
            <div
              className="absolute bottom-0 left-0 w-3 h-3 cursor-sw-resize"
              onMouseDown={(e) => handleResizeStart(e, 'sw')}
              title="Drag to resize"
            />
            
            {/* Bottom-right corner */}
            <div
              className="absolute bottom-0 right-0 w-3 h-3 cursor-se-resize"
              onMouseDown={(e) => handleResizeStart(e, 'se')}
              title="Drag to resize"
            />
          </>
        )}
      </div>
    </div>
    </>
  );
};

export default CedarChat;
