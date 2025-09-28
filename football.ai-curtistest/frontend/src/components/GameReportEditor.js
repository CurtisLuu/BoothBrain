import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Loader2, FileText, Edit3, RefreshCw } from 'lucide-react';
import { useDarkMode } from '../contexts/DarkModeContext';
import chatApi from '../services/chatApi';

const GameReportEditor = () => {
  const { gameId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { isDarkMode } = useDarkMode();
  
  const [game, setGame] = useState(null);
  const [reportText, setReportText] = useState('');
  const [editedText, setEditedText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [pageLength, setPageLength] = useState('2'); // Default to 2 pages
  const [reportStatus, setReportStatus] = useState('');

  useEffect(() => {
    // Get game data from location state or params
    const gameFromState = location.state?.game;
    if (gameFromState) {
      console.log('Game data from state:', gameFromState);
      setGame(gameFromState);
      generateInitialReport(gameFromState);
    } else if (gameId) {
      // If we only have gameId, we'll need to fetch game data
      console.log('Game ID from params:', gameId);
      // For now, create a mock game object
      const mockGame = {
        id: gameId,
        away_team: 'Away Team',
        home_team: 'Home Team',
        date: 'TBD',
        time: 'TBD',
        status: 'Scheduled',
        league: 'nfl'
      };
      setGame(mockGame);
      generateInitialReport(mockGame);
    }
  }, [gameId, location.state]);

  const generateInitialReport = async (gameData) => {
    setIsGenerating(true);
    try {
      console.log('Generating initial report for:', gameData);
      
      // Extract team names from the game data
      const awayTeam = gameData.away_team || gameData.awayTeam || 'Away Team';
      const homeTeam = gameData.home_team || gameData.homeTeam || 'Home Team';
      const gameDate = gameData.date || gameData.gameDate || 'TBD';
      const gameTime = gameData.time || gameData.gameTime || 'TBD';
      const gameStatus = gameData.status || gameData.gameStatus || 'Scheduled';
      const league = gameData.league || 'nfl';
      
      // Create a properly formatted game object for the API
      const formattedGame = {
        id: gameData.id || 'unknown',
        away_team: awayTeam,
        home_team: homeTeam,
        date: gameDate,
        time: gameTime,
        status: gameStatus,
        league: league
      };
      
      console.log('Formatted game data for API:', formattedGame);
      
      const response = await fetch('http://localhost:3000/generate-game-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          game: formattedGame,
          league: league,
          page_length: parseInt(pageLength) // Add page length parameter
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setReportText(data.report);
      setEditedText(data.report);
      
    } catch (error) {
      console.error('Error generating report:', error);
      // Fallback report with actual team names
      const awayTeam = gameData.away_team || gameData.awayTeam || 'Away Team';
      const homeTeam = gameData.home_team || gameData.homeTeam || 'Home Team';
      const gameDate = gameData.date || gameData.gameDate || 'TBD';
      const gameTime = gameData.time || gameData.gameTime || 'TBD';
      const gameStatus = gameData.status || gameData.gameStatus || 'Scheduled';
      const league = gameData.league || 'nfl';
      
      const fallbackReport = `COMPREHENSIVE GAME REPORT
=====================================

MATCHUP: ${awayTeam} vs ${homeTeam}
DATE: ${gameDate}
TIME: ${gameTime}
STATUS: ${gameStatus}
LEAGUE: ${league.toUpperCase()}

EXECUTIVE SUMMARY
=================
This ${league.toUpperCase()} matchup features ${awayTeam} taking on ${homeTeam} in what promises to be an exciting contest.

TEAM ANALYSIS
=============
Both teams enter this game with their own strengths and challenges. The ${awayTeam} will look to establish their game plan early, while the ${homeTeam} will aim to use their home field advantage.

KEY PLAYERS TO WATCH
===================
- Monitor the performance of key offensive and defensive players
- Watch for impact plays from special teams
- Focus on quarterback performance and decision-making

STATISTICAL BREAKDOWN
====================
Detailed statistics will be available closer to game time. Both teams will look to establish their preferred style of play early in the contest.

PREDICTION
==========
This game could go either way depending on execution, coaching decisions, and key plays. The team that minimizes mistakes and capitalizes on opportunities will likely emerge victorious.

Generated: ${new Date().toLocaleString()}`;
      
      setReportText(fallbackReport);
      setEditedText(fallbackReport);
    } finally {
      setIsGenerating(false);
    }
  };

  const regenerateReport = async () => {
    if (!game) return;
    await generateInitialReport(game);
  };


  const downloadPDF = async () => {
    if (!editedText.trim()) {
      alert('Please enter some text to download');
      return;
    }

    setIsSaving(true);
    try {
      const awayTeam = game?.away_team || game?.awayTeam || 'Away';
      const homeTeam = game?.home_team || game?.homeTeam || 'Home';
      
      const response = await chatApi.generatePDF(
        game?.id || 'game-report', 
        editedText, 
        `${awayTeam}_vs_${homeTeam}_Report.pdf`
      );
      
      // Create download link
      const link = document.createElement('a');
      link.href = response.pdf_data;
      link.download = response.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(link.href); // Clean up the URL object
      
      alert('PDF downloaded successfully!');
    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert(`Failed to download PDF: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };


  if (!game) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary-600" />
          <p className="text-gray-600 dark:text-gray-300">Loading game data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back</span>
              </button>
              <div className="h-6 w-px bg-gray-300 dark:bg-gray-600"></div>
              <div className="flex items-center space-x-3">
                <FileText className="w-6 h-6 text-primary-600" />
                <div>
                  <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Game Report Editor
                  </h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {game.away_team || game.awayTeam || 'Away Team'} vs {game.home_team || game.homeTeam || 'Home Team'}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={regenerateReport}
                disabled={isGenerating}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {isGenerating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
                <span>Regenerate Report</span>
              </button>
              
              <button
                onClick={downloadPDF}
                disabled={isSaving || !editedText.trim()}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                <span>Download PDF</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Report Text Editor */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                <Edit3 className="w-5 h-5 mr-2 text-primary-600" />
                Game Report Editor
              </h2>
              
              {/* Page Length Selector */}
              <div className="flex items-center space-x-3">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Report Length:
                </label>
                <select
                  value={pageLength}
                  onChange={(e) => setPageLength(e.target.value)}
                  className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="1">1 Page (Quick)</option>
                  <option value="2">2 Pages (Standard)</option>
                  <option value="3">3 Pages (Detailed)</option>
                  <option value="4">4 Pages (Comprehensive)</option>
                  <option value="5">5 Pages (Extensive)</option>
                </select>
              </div>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Edit the generated report text below. You can modify any section to customize your analysis.
            </p>
          </div>
          
          <div className="p-6">
            {isGenerating ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary-600" />
                  <p className="text-gray-600 dark:text-gray-300 mb-2">Generating comprehensive report...</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">This may take 10-30 seconds</p>
                  <div className="mt-4 w-64 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div className="bg-primary-600 h-2 rounded-full animate-pulse" style={{width: '60%'}}></div>
                  </div>
                </div>
              </div>
            ) : (
              <textarea
                value={editedText}
                onChange={(e) => setEditedText(e.target.value)}
                className="w-full h-[600px] p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none font-mono text-sm"
                placeholder="Report text will appear here..."
              />
            )}
          </div>
          
          {/* Action Buttons */}
          <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Character count: {editedText.length}
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={regenerateReport}
                  disabled={isGenerating}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  {isGenerating ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4" />
                  )}
                  <span>Regenerate Report</span>
                </button>
                
                <button
                  onClick={downloadPDF}
                  disabled={isSaving || !editedText.trim()}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  {isSaving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Download className="w-4 h-4" />
                  )}
                  <span>Download PDF</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameReportEditor;
