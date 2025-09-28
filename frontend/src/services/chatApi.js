// Chat API service for Cedar Chat
class ChatApiService {
  constructor() {
    this.apiBaseUrl = 'http://localhost:8000';
  }

  async sendMessage(message, sessionId, context = 'general') {
    try {
      const response = await fetch(`${this.apiBaseUrl}/ask-nfl-expert`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: message,
          context: context
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  async createSession() {
    try {
      const response = await fetch(`${this.apiBaseUrl}/create-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error creating session:', error);
      // Return a mock session ID if the endpoint doesn't exist
      return { sessionId: `session_${Date.now()}` };
    }
  }

  async getSessions() {
    try {
      const response = await fetch(`${this.apiBaseUrl}/sessions`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error getting sessions:', error);
      return { sessions: [] };
    }
  }
}

const chatApiService = new ChatApiService();
export default chatApiService;
