from flask import Flask, jsonify, request
from flask_cors import CORS
import requests
import json

app = Flask(__name__)
CORS(app)

# ESPN API endpoints
ESPN_BASE_URL = "https://site.api.espn.com/apis/site/v2/sports"
ESPN_CORE_URL = "https://sports.core.api.espn.com/v2/sports/football/leagues"

@app.route('/api/nfl/games', methods=['GET'])
def get_nfl_games():
    """Get NFL games from ESPN API"""
    try:
        url = f"{ESPN_BASE_URL}/football/nfl/scoreboard"
        response = requests.get(url)
        response.raise_for_status()
        data = response.json()
        
        # Process and format the data
        games = []
        for event in data.get('events', []):
            game = {
                'id': event.get('id'),
                'date': event.get('date'),
                'name': event.get('name'),
                'shortName': event.get('shortName'),
                'status': event.get('status', {}).get('type', {}).get('name', 'Unknown'),
                'competitions': event.get('competitions', [])
            }
            games.append(game)
        
        return jsonify(games)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/ncaa/games', methods=['GET'])
def get_ncaa_games():
    """Get NCAA games from ESPN API"""
    try:
        url = f"{ESPN_BASE_URL}/football/college-football/scoreboard"
        response = requests.get(url)
        response.raise_for_status()
        data = response.json()
        
        # Process and format the data
        games = []
        for event in data.get('events', []):
            game = {
                'id': event.get('id'),
                'date': event.get('date'),
                'name': event.get('name'),
                'shortName': event.get('shortName'),
                'status': event.get('status', {}).get('type', {}).get('name', 'Unknown'),
                'competitions': event.get('competitions', [])
            }
            games.append(game)
        
        return jsonify(games)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'healthy', 'message': 'Football AI Backend is running'})

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
