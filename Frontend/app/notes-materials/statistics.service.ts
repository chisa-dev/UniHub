import { API_ENDPOINTS } from '@/config/apiConfig';

export interface TopicProgress {
  topicId: string;
  topicTitle: string;
  progress: number;
  materialsCount: number;
}

export interface StatisticsSummary {
  total_topics_studied: number;
  total_quizzes_attempted: number;
  total_notes_read: number;
  total_study_hours: number;
  avg_topic_progress: string;
  avg_quiz_progress: string;
  avg_quiz_score: string;
  total_materials: string;
}

export interface StatisticsResponse {
  topics_progress: TopicProgress[];
  quiz_progress: any[];
  note_progress: any[];
  study_hours: any[];
  summary: StatisticsSummary;
}

export const getStatistics = async (): Promise<StatisticsResponse> => {
  try {
    let token = '';
    
    // Check if we're in a browser environment
    if (typeof window !== 'undefined') {
      token = localStorage.getItem('token') || '';
    }
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    // Only add authorization header if token exists
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(API_ENDPOINTS.STATISTICS.GET, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      throw new Error('Failed to fetch statistics');
    }

    return await response.json();
  } catch (error) {
    console.error('[LOG statistics_service] ========= Error fetching statistics:', error);
    throw error;
  }
}; 