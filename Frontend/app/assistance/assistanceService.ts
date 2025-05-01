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
      
      // This is a mock implementation - when integrating with a real API,
      // you'll need to update API_ENDPOINTS and replace this with an actual fetch call
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock response
      return {
        message: `This is a mock response to: "${data.message}"`,
        timestamp: new Date()
      };
      
      // Real implementation would look something like this:
      /*
      const response = await fetch(API_ENDPOINTS.ASSISTANCE.SEND_MESSAGE, {
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

      return await response.json();
      */
    } catch (error) {
      console.error('[LOG assistance] ========= Error sending message:', error);
      throw error;
    }
  },
  
  async getTopicFilesCount(topicId: string): Promise<number> {
    try {
      if (isServer()) {
        return 0;
      }
      
      const token = authService.getToken();
      
      if (!token) {
        throw new Error('Authentication required');
      }
      
      // This is a mock implementation
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Return mock file count (random between 0-10)
      return Math.floor(Math.random() * 11);
      
      // Real implementation would look something like this:
      /*
      const response = await fetch(API_ENDPOINTS.ASSISTANCE.GET_TOPIC_FILES(topicId), {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to get topic files');
      }

      const data = await response.json();
      return data.filesCount;
      */
    } catch (error) {
      console.error('[LOG assistance] ========= Error getting topic files count:', error);
      // Return 0 as a fallback
      return 0;
    }
  }
}; 