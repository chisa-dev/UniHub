import { API_ENDPOINTS } from '@/config/apiConfig';

export interface Quiz {
  id: string;
  title: string;
  description: string;
  topic_id: string;
  user_id: string;
  is_public: number;
  is_ai_generated: number;
  created_at: string;
  updated_at: string;
  topic_title?: string;
  creator_name?: string;
  question_count: number;
  attempt_count: number;
}

export interface QuizzesResponse {
  quizzes: Quiz[];
  pagination: {
    total: number;
    page: number;
    totalPages: number;
  };
}

// Helper function to safely get token - only runs client-side
const getToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
};

export const getAllQuizzes = async (): Promise<QuizzesResponse> => {
  try {
    const token = getToken();
    
    if (!token) {
      throw new Error('Authentication required');
    }
    
    const response = await fetch(`${API_ENDPOINTS.QUIZZES.LIST}?page=1&limit=10`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch quizzes');
    }

    return await response.json();
  } catch (error) {
    console.error('[LOG quizzes_service] ========= Error fetching all quizzes:', error);
    throw error;
  }
};

export const getQuizzesByTopic = async (topicId: string): Promise<QuizzesResponse> => {
  try {
    const token = getToken();
    
    if (!token) {
      throw new Error('Authentication required');
    }
    
    const response = await fetch(`${API_ENDPOINTS.QUIZZES.LIST}?topic_id=${topicId}&page=1&limit=10`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch quizzes by topic');
    }

    return await response.json();
  } catch (error) {
    console.error('[LOG quizzes_service] ========= Error fetching quizzes by topic:', error);
    throw error;
  }
};

export const getQuiz = async (quizId: string): Promise<Quiz> => {
  try {
    const token = getToken();
    
    if (!token) {
      throw new Error('Authentication required');
    }
    
    const response = await fetch(API_ENDPOINTS.QUIZZES.GET(quizId), {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch quiz');
    }

    return await response.json();
  } catch (error) {
    console.error('[LOG quizzes_service] ========= Error fetching quiz:', error);
    throw error;
  }
};

export const createQuiz = async (quizData: Partial<Quiz>): Promise<Quiz> => {
  try {
    const token = getToken();
    
    if (!token) {
      throw new Error('Authentication required');
    }
    
    const response = await fetch(API_ENDPOINTS.QUIZZES.CREATE, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(quizData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to create quiz');
    }

    return await response.json();
  } catch (error) {
    console.error('[LOG quizzes_service] ========= Error creating quiz:', error);
    throw error;
  }
};

export const updateQuiz = async (quizId: string, quizData: Partial<Quiz>): Promise<Quiz> => {
  try {
    const token = getToken();
    
    if (!token) {
      throw new Error('Authentication required');
    }
    
    const response = await fetch(API_ENDPOINTS.QUIZZES.UPDATE(quizId), {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(quizData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update quiz');
    }

    return await response.json();
  } catch (error) {
    console.error('[LOG quizzes_service] ========= Error updating quiz:', error);
    throw error;
  }
};

export const deleteQuiz = async (quizId: string): Promise<void> => {
  try {
    const token = getToken();
    
    if (!token) {
      throw new Error('Authentication required');
    }
    
    const response = await fetch(API_ENDPOINTS.QUIZZES.DELETE(quizId), {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to delete quiz');
    }
  } catch (error) {
    console.error('[LOG quizzes_service] ========= Error deleting quiz:', error);
    throw error;
  }
}; 