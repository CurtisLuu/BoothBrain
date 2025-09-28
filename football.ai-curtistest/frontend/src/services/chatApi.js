// Chat API service for Cedar Chat
class ChatApiService {
  constructor() {
    this.apiBaseUrl = 'http://localhost:3000';
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

  async uploadPDF(formData) {
    try {
      console.log('chatApi.uploadPDF called with FormData');
      console.log('API Base URL:', this.apiBaseUrl);
      
      const response = await fetch(`${this.apiBaseUrl}/upload-pdf`, {
        method: 'POST',
        body: formData,
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Response error:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const data = await response.json();
      console.log('Upload successful, data:', data);
      return data;
    } catch (error) {
      console.error('Error uploading PDF:', error);
      throw error;
    }
  }

  async getPDFInfo(fileId) {
    try {
      const response = await fetch(`${this.apiBaseUrl}/pdf-info/${fileId}`, {
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
      console.error('Error getting PDF info:', error);
      throw error;
    }
  }

  async processPDFWithGemini(fileId, text, prompt = '') {
    try {
      const response = await fetch(`${this.apiBaseUrl}/process-pdf-gemini`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          file_id: fileId,
          text: text,
          prompt: prompt
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error processing PDF with Gemini:', error);
      throw error;
    }
  }

  async getPDFPreview(fileId) {
    try {
      const response = await fetch(`${this.apiBaseUrl}/pdf-preview/${fileId}`, {
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
      console.error('Error getting PDF preview:', error);
      throw error;
    }
  }

  async generatePDF(fileId, editedText, filename = 'edited_document.pdf') {
    try {
      const response = await fetch(`${this.apiBaseUrl}/generate-pdf`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          file_id: fileId,
          edited_text: editedText,
          filename: filename
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw error;
    }
  }

  async extractPDFText(fileId) {
    try {
      const response = await fetch(`${this.apiBaseUrl}/extract-pdf-text`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          file_id: fileId
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error extracting PDF text:', error);
      throw error;
    }
  }
}

const chatApiService = new ChatApiService();
export default chatApiService;
