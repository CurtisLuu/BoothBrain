// PDF Generation Utility
// This is a simplified PDF generator for game statistics
// In a production environment, you would use a library like jsPDF

export const generateGameStatsPDF = (gameData, statsData) => {
  // Create a canvas to render the PDF content
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  // Set canvas size (A4 dimensions at 96 DPI)
  canvas.width = 794; // A4 width in pixels
  canvas.height = 1123; // A4 height in pixels
  
  // Set background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Set default font
  ctx.fillStyle = '#000000';
  ctx.font = 'bold 24px Arial';
  
  // Title
  ctx.fillText('Game Statistics Report', 50, 50);
  
  // Game Information
  ctx.font = 'bold 18px Arial';
  ctx.fillText(`${gameData.awayTeam} vs ${gameData.homeTeam}`, 50, 100);
  
  ctx.font = '14px Arial';
  ctx.fillText(`Date: ${gameData.date}`, 50, 130);
  ctx.fillText(`Time: ${gameData.time}`, 50, 150);
  ctx.fillText(`Week: ${gameData.week}`, 50, 170);
  ctx.fillText(`Status: ${gameData.status}`, 50, 190);
  ctx.fillText(`League: ${gameData.league?.toUpperCase()}`, 50, 210);
  
  // Score
  ctx.font = 'bold 20px Arial';
  const scoreText = gameData.status === 'Scheduled' || gameData.status === 'Pre-Game' 
    ? '0 - 0' 
    : `${gameData.awayScore} - ${gameData.homeScore}`;
  ctx.fillText(`Final Score: ${scoreText}`, 50, 250);
  
  // Draw a line
  ctx.strokeStyle = '#cccccc';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(50, 280);
  ctx.lineTo(canvas.width - 50, 280);
  ctx.stroke();
  
  // Team Statistics
  let yPosition = 320;
  ctx.font = 'bold 16px Arial';
  ctx.fillText('Team Statistics', 50, yPosition);
  yPosition += 30;
  
  if (statsData && statsData.gameBoxscore && statsData.gameBoxscore.teamStats) {
    const awayTeamStats = statsData.gameBoxscore.teamStats[gameData.awayTeam];
    const homeTeamStats = statsData.gameBoxscore.teamStats[gameData.homeTeam];
    
    if (awayTeamStats) {
      ctx.font = 'bold 14px Arial';
      ctx.fillText(gameData.awayTeam, 50, yPosition);
      yPosition += 20;
      
      ctx.font = '12px Arial';
      Object.entries(awayTeamStats).forEach(([key, value]) => {
        if (typeof value === 'number' || typeof value === 'string') {
          ctx.fillText(`${key}: ${value}`, 70, yPosition);
          yPosition += 15;
        }
      });
      yPosition += 10;
    }
    
    if (homeTeamStats) {
      ctx.font = 'bold 14px Arial';
      ctx.fillText(gameData.homeTeam, 50, yPosition);
      yPosition += 20;
      
      ctx.font = '12px Arial';
      Object.entries(homeTeamStats).forEach(([key, value]) => {
        if (typeof value === 'number' || typeof value === 'string') {
          ctx.fillText(`${key}: ${value}`, 70, yPosition);
          yPosition += 15;
        }
      });
    }
  } else {
    // Fallback data
    ctx.font = '12px Arial';
    ctx.fillText('Detailed statistics not available', 50, yPosition);
    yPosition += 20;
    ctx.fillText('This game may be scheduled or statistics are still being processed.', 50, yPosition);
  }
  
  // Footer
  yPosition = canvas.height - 50;
  ctx.font = '10px Arial';
  ctx.fillStyle = '#666666';
  ctx.fillText(`Generated on ${new Date().toLocaleString()}`, 50, yPosition);
  ctx.fillText('Football AI Analytics Platform', canvas.width - 200, yPosition);
  
  // Convert canvas to blob and create download
  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${gameData.homeTeam}_vs_${gameData.awayTeam}_stats.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      resolve();
    }, 'image/png'); // Note: This creates a PNG, not a true PDF
  });
};

// Alternative: Generate a simple HTML-based PDF using browser print
export const generateGameStatsHTMLPDF = (gameData, statsData) => {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Game Statistics - ${gameData.awayTeam} vs ${gameData.homeTeam}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .header { text-align: center; margin-bottom: 30px; }
        .game-info { margin-bottom: 20px; }
        .stats-section { margin-bottom: 30px; }
        .team-stats { margin-bottom: 20px; }
        .stat-row { display: flex; justify-content: space-between; margin-bottom: 5px; }
        .footer { margin-top: 50px; text-align: center; color: #666; }
        @media print {
          body { margin: 20px; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Game Statistics Report</h1>
        <h2>${gameData.awayTeam} vs ${gameData.homeTeam}</h2>
      </div>
      
      <div class="game-info">
        <p><strong>Date:</strong> ${gameData.date}</p>
        <p><strong>Time:</strong> ${gameData.time}</p>
        <p><strong>Week:</strong> ${gameData.week}</p>
        <p><strong>Status:</strong> ${gameData.status}</p>
        <p><strong>League:</strong> ${gameData.league?.toUpperCase()}</p>
        <p><strong>Final Score:</strong> ${
          gameData.status === 'Scheduled' || gameData.status === 'Pre-Game' 
            ? '0 - 0' 
            : `${gameData.awayScore} - ${gameData.homeScore}`
        }</p>
      </div>
      
      <div class="stats-section">
        <h3>Team Statistics</h3>
        ${statsData && statsData.gameBoxscore && statsData.gameBoxscore.teamStats ? 
          Object.entries(statsData.gameBoxscore.teamStats).map(([teamName, teamStats]) => `
            <div class="team-stats">
              <h4>${teamName}</h4>
              ${Object.entries(teamStats).map(([key, value]) => 
                `<div class="stat-row"><span>${key}:</span><span>${value}</span></div>`
              ).join('')}
            </div>
          `).join('') :
          '<p>Detailed statistics not available. This game may be scheduled or statistics are still being processed.</p>'
        }
      </div>
      
      <div class="footer">
        <p>Generated on ${new Date().toLocaleString()}</p>
        <p>Football AI Analytics Platform</p>
      </div>
    </body>
    </html>
  `;
  
  // Create a new window with the HTML content
  const printWindow = window.open('', '_blank');
  printWindow.document.write(htmlContent);
  printWindow.document.close();
  
  // Wait for content to load, then trigger print
  printWindow.onload = () => {
    printWindow.print();
    printWindow.close();
  };
};
