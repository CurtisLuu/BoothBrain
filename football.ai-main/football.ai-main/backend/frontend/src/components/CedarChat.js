import React, { useState, useEffect, useRef } from 'react';
import { Send, ChevronUp, ChevronDown, Trash2, X, Copy, RotateCcw, ThumbsUp, ThumbsDown, Maximize2, Minimize2 } from 'lucide-react';
import { useDarkMode } from '../contexts/DarkModeContext';
import chatApi from '../services/chatApi';

const CedarChat = () => {
  const { isDarkMode } = useDarkMode();
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [chatHeight, setChatHeight] = useState(600);
  const [chatWidth, setChatWidth] = useState(672); // 2xl = 672px
  const [isResizing, setIsResizing] = useState(false);
  const [resizeType, setResizeType] = useState(null); // 'se', 'sw', 'ne', 'nw'
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const chatContainerRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when expanded
  useEffect(() => {
    if (isExpanded && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isExpanded]);

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
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isResizing || !resizeType) return;
      
      const container = chatContainerRef.current;
      if (!container) return;
      
      const rect = container.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      let newWidth = chatWidth;
      let newHeight = chatHeight;
      
      // Calculate new dimensions based on resize type
      switch (resizeType) {
        case 'se': // Southeast (bottom-right)
          newWidth = Math.max(400, Math.min(1200, e.clientX - rect.left));
          newHeight = Math.max(300, Math.min(800, e.clientY - rect.top));
          break;
        case 'sw': // Southwest (bottom-left)
          newWidth = Math.max(400, Math.min(1200, rect.right - e.clientX));
          newHeight = Math.max(300, Math.min(800, e.clientY - rect.top));
          break;
        case 'ne': // Northeast (top-right)
          newWidth = Math.max(400, Math.min(1200, e.clientX - rect.left));
          newHeight = Math.max(300, Math.min(800, rect.bottom - e.clientY));
          break;
        case 'nw': // Northwest (top-left)
          newWidth = Math.max(400, Math.min(1200, rect.right - e.clientX));
          newHeight = Math.max(300, Math.min(800, rect.bottom - e.clientY));
          break;
      }
      
      setChatWidth(newWidth);
      setChatHeight(newHeight);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      setResizeType(null);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, resizeType, chatWidth, chatHeight]);

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
      
              const assistantMessage = {
                id: Date.now() + 1,
                role: 'assistant',
                content: data.message.content,
                timestamp: data.message.timestamp
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
    
    try {
      await chatApi.clearChat(sessionId);
      setMessages([]);
    } catch (error) {
      console.error('Error clearing chat:', error);
    }
  };

  const copyMessage = (content) => {
    navigator.clipboard.writeText(content);
  };

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
        return <div key={index} className="font-bold text-lg mb-2 mt-3 text-green-400">{trimmedLine.slice(2, -2)}</div>;
      } else if (trimmedLine.startsWith('*') && trimmedLine.endsWith('*') && trimmedLine.length > 2 && !trimmedLine.startsWith('**')) {
        // Italic text
        return <div key={index} className="italic text-gray-300 mb-1">{trimmedLine.slice(1, -1)}</div>;
      } else if (trimmedLine.startsWith('#')) {
        // Headers
        const level = trimmedLine.match(/^#+/)[0].length;
        const text = trimmedLine.replace(/^#+\s*/, '');
        const className = level === 1 ? 'text-xl font-bold text-green-400 mb-3 mt-4' :
                         level === 2 ? 'text-lg font-semibold text-green-300 mb-2 mt-3' :
                         'text-base font-medium text-green-200 mb-1 mt-2';
        return <div key={index} className={className}>{text}</div>;
      } else if (trimmedLine.startsWith('- ') || trimmedLine.startsWith('• ')) {
        // Bullet points
        return <div key={index} className="ml-4 mb-1 text-gray-200">• {trimmedLine.slice(2)}</div>;
      } else if (trimmedLine.match(/^\d+\.\s/)) {
        // Numbered lists
        return <div key={index} className="ml-4 mb-1 text-gray-200">{trimmedLine}</div>;
      } else if (trimmedLine.startsWith('```')) {
        // Code blocks (simplified handling)
        return <div key={index} className="bg-gray-900 p-3 rounded-lg font-mono text-sm text-green-300 my-2 border border-gray-600">{trimmedLine}</div>;
      } else if (trimmedLine.startsWith('`') && trimmedLine.endsWith('`')) {
        // Inline code
        return <span key={index} className="bg-gray-700 px-2 py-1 rounded font-mono text-sm text-green-300">{trimmedLine.slice(1, -1)}</span>;
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

  const handleResizeStart = (e, type) => {
    e.preventDefault();
    setIsResizing(true);
    setResizeType(type);
  };

  const resetSize = () => {
    setChatWidth(672);
    setChatHeight(600);
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
      
      <div className={`fixed z-50 transition-all duration-300 ${
        isExpanded 
          ? 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2' 
          : 'bottom-4 left-1/2 transform -translate-x-1/2 w-full px-4 max-w-md'
      }`}>
      {/* Chat Container */}
      <div 
        ref={chatContainerRef}
        className={`bg-gray-900 dark:bg-gray-800 rounded-3xl border border-gray-700 dark:border-gray-600 transition-all duration-300 relative ${
          isExpanded ? '' : 'h-auto'
        }`}
        style={isExpanded ? { 
          width: `${chatWidth}px`, 
          height: `${chatHeight}px`,
          maxWidth: '90vw',
          maxHeight: '90vh'
        } : {}}
      >
        
        {/* Chat Header - Only shown when expanded */}
        {isExpanded && (
          <div className="flex items-center justify-between p-4 border-b border-gray-700 dark:border-gray-600">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              </div>
              <span className="text-white font-medium">Assistant</span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={resetSize}
                className="p-1 hover:bg-gray-700 rounded-full transition-colors"
                aria-label="Reset size"
              >
                <Minimize2 className="w-4 h-4 text-gray-400" />
              </button>
              <button
                onClick={maximizeSize}
                className="p-1 hover:bg-gray-700 rounded-full transition-colors"
                aria-label="Maximize size"
              >
                <Maximize2 className="w-4 h-4 text-gray-400" />
              </button>
              <button
                onClick={() => setIsExpanded(false)}
                className="p-1 hover:bg-gray-700 rounded-full transition-colors"
                aria-label="Collapse"
              >
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </button>
              <button
                onClick={clearChat}
                className="p-1 hover:bg-gray-700 rounded-full transition-colors"
                aria-label="Clear chat"
              >
                <Trash2 className="w-4 h-4 text-gray-400" />
              </button>
              <button
                onClick={() => setIsExpanded(false)}
                className="p-1 hover:bg-gray-700 rounded-full transition-colors"
                aria-label="Close"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          </div>
        )}

        {/* Messages Area - Only shown when expanded */}
        {isExpanded && (
          <div 
            className="flex-1 overflow-y-auto p-4 space-y-4 cedar-chat-scrollbar" 
            style={{ 
              maxHeight: `${chatHeight - 200}px`,
              scrollbarWidth: 'thin',
              scrollbarColor: '#4B5563 #1F2937'
            }}
          >
            {messages.map((message) => (
              <div key={message.id} className="space-y-2">
                {/* User Message */}
                {message.role === 'user' && (
                  <div className="flex justify-end">
                    <div className="bg-gray-700 dark:bg-gray-600 rounded-2xl px-4 py-2 max-w-[80%]">
                      <p className="text-white text-sm">{message.content}</p>
                    </div>
                  </div>
                )}

                {/* Assistant Message */}
                {message.role === 'assistant' && (
                  <div className="space-y-2">
                    {/* Assistant Response */}
                    <div className="bg-gray-800 dark:bg-gray-700 rounded-2xl px-6 py-4 shadow-lg">
                      <div className="prose prose-invert prose-sm max-w-none cedar-chat-message">
                        <div className="text-white leading-relaxed whitespace-pre-wrap break-words">
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

        {/* Resize Handles - Only shown when expanded */}
        {isExpanded && (
          <>
            {/* Top-left corner */}
            <div
              className="absolute top-0 left-0 w-3 h-3 cursor-nw-resize bg-gray-600 hover:bg-gray-500 transition-colors"
              onMouseDown={(e) => handleResizeStart(e, 'nw')}
              style={{ 
                clipPath: 'polygon(0% 0%, 100% 0%, 0% 100%)',
                borderRadius: '12px 0 0 0'
              }}
              title="Drag to resize"
            />
            
            {/* Top-right corner */}
            <div
              className="absolute top-0 right-0 w-3 h-3 cursor-ne-resize bg-gray-600 hover:bg-gray-500 transition-colors"
              onMouseDown={(e) => handleResizeStart(e, 'ne')}
              style={{ 
                clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%)',
                borderRadius: '0 12px 0 0'
              }}
              title="Drag to resize"
            />
            
            {/* Bottom-left corner */}
            <div
              className="absolute bottom-0 left-0 w-3 h-3 cursor-sw-resize bg-gray-600 hover:bg-gray-500 transition-colors"
              onMouseDown={(e) => handleResizeStart(e, 'sw')}
              style={{ 
                clipPath: 'polygon(0% 0%, 0% 100%, 100% 100%)',
                borderRadius: '0 0 0 12px'
              }}
              title="Drag to resize"
            />
            
            {/* Bottom-right corner */}
            <div
              className="absolute bottom-0 right-0 w-3 h-3 cursor-se-resize bg-gray-600 hover:bg-gray-500 transition-colors"
              onMouseDown={(e) => handleResizeStart(e, 'se')}
              style={{ 
                clipPath: 'polygon(100% 0%, 0% 100%, 100% 100%)',
                borderRadius: '0 0 12px 0'
              }}
              title="Drag to resize"
            />
          </>
        )}

        {/* Input Area */}
        <div className="p-3">
          <div className="flex items-center space-x-3">
            <div className="flex-1 relative">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                onFocus={() => !isExpanded && setIsExpanded(true)}
                placeholder="Ask a question..."
                className="w-full bg-gray-800 dark:bg-gray-700 border border-gray-800 dark:border-gray-700 rounded-2xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-green-500/50"
                disabled={isLoading}
              />
            </div>
            
            {/* Send Button */}
            <button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isLoading}
              className="p-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-full transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default CedarChat;
