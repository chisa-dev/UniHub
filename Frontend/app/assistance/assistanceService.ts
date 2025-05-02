import { API_ENDPOINTS } from '@/config/apiConfig';
import { authService } from '../auth/authService';
import { SendMessageRequest, SendMessageResponse } from './types';

// Helper function to check if we're on the server
const isServer = () => typeof window === 'undefined';

export const assistanceService = {
  async sendMessage(data: SendMessageRequest): Promise<SendMessageResponse> {
    try {
      if (isServer()) {
        throw new Error('Cannot send message on server side');
      }
      
      const token = authService.getToken();
      
      if (!token) {
        throw new Error('Authentication required');
      }
      
      // Call the RAG chat API endpoint
      const response = await fetch(`${API_ENDPOINTS.RAG.CHAT}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to send message');
      }

      const responseData = await response.json();
      
      // The API might return different formats, so we need to handle all possibilities
      // Format the response to match our expected type
      return {
        message: responseData.response || responseData.message || responseData.content || "I'm sorry, I couldn't generate a response.",
        timestamp: new Date()
      };
    } catch (error) {
      console.error('[LOG assistance] ========= Error sending message:', error);
      throw error;
    }
  },
  
  async getTopicMaterialsCount(topicId: string): Promise<number> {
    try {
      if (isServer()) {
        return 0;
      }
      
      const token = authService.getToken();
      
      if (!token) {
        throw new Error('Authentication required');
      }
      
      // Call the API to get materials for the topic
      const response = await fetch(API_ENDPOINTS.MATERIALS.BY_TOPIC(topicId), {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to get topic materials');
      }

      // The response is an array of materials, so we count its length
      const materials = await response.json();
      return Array.isArray(materials) ? materials.length : 0;
    } catch (error) {
      console.error('[LOG assistance] ========= Error getting topic materials count:', error);
      // Return 0 as a fallback
      return 0;
    }
  }
}; 