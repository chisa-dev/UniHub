import { API_ENDPOINTS } from '@/config/apiConfig';
import { 
  CreateQuizParams, 
  QuizAnswers, 
  QuizAttempt, 
  QuizAttemptResult, 
  QuizListResponse, 
  QuizWithQuestions, 
  Topic
}
from './types';

// Import Quiz directly
import type { Quiz } from './types';

// Re-export Quiz for use in other components
export type { Quiz } from './types';

// Import Quiz directly
import type { Quiz }
from './types';

// Import Quiz directly
import type { Quiz } from './types';

// Re-export Quiz for use in other components
export type { Quiz } from './types';

// Re-export Quiz for use in other components
export type { Quiz }
from './types';

// Import Quiz directly
import type { Quiz } from './types';

// Re-export Quiz for use in other components
export type { Quiz } from './types';

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

class QuizzesService {
  async getTopics(): Promise<Topic[]> {
    try {
      const token = getToken();
      
      const response = await fetch(API_ENDPOINTS.TOPICS.LIST, {
        method: 'GET',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch topics');
      }

      const data = await response.json();
      return data.topics || [];
    } catch (error) {
      console.error('[LOG error] ========= Error fetching topics:', error instanceof Error ? error.message : String(error));
      throw error;
    }
  }

  async getQuizzes(page = 1, limit = 10): Promise<QuizListResponse> {
    try {
      const token = getToken();
      
      const response = await fetch(`${API_ENDPOINTS.QUIZZES.LIST}?page=${page}&limit=${limit}`, {
        method: 'GET',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch quizzes');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('[LOG error] ========= Error fetching quizzes:', error instanceof Error ? error.message : String(error));
      throw error;
    }
  }

  async getQuizById(id: string): Promise<QuizWithQuestions> {
    try {
      const token = getToken();
      
      const response = await fetch(API_ENDPOINTS.QUIZZES.GET(id), {
        method: 'GET',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch quiz');
      }

      const data = await response.json();
      return {
        ...data.quiz,
        questions: data.questions,
      };
    } catch (error) {
      console.error('[LOG error] ========= Error fetching quiz by ID:', error instanceof Error ? error.message : String(error));
      throw error;
    }
  }

  async createQuiz(params: CreateQuizParams): Promise<Quiz> {
    try {
      const token = getToken();
      
      if (!token) {
        throw new Error('Authentication required');
      }
      
      const response = await fetch(API_ENDPOINTS.QUIZZES.CREATE_RAG, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        throw new Error('Failed to create quiz');
      }

      const data = await response.json();
      return data.quiz;
    } catch (error) {
      console.error('[LOG error] ========= Error creating quiz:', error instanceof Error ? error.message : String(error));
      throw error;
    }
  }

  async submitQuizAttempt(quizId: string, answers: QuizAnswers): Promise<QuizAttemptResult> {
    try {
      const token = getToken();
      
      if (!token) {
        throw new Error('Authentication required');
      }
      
      const response = await fetch(API_ENDPOINTS.QUIZZES.SUBMIT_ATTEMPT(quizId), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ answers }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit quiz attempt');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('[LOG error] ========= Error submitting quiz attempt:', error instanceof Error ? error.message : String(error));
      throw error;
    }
  }

  async getQuizAttempts(quizId: string): Promise<QuizAttempt[]> {
    try {
      const token = getToken();
      
      if (!token) {
        throw new Error('Authentication required');
      }
      
      const response = await fetch(API_ENDPOINTS.QUIZZES.GET_ATTEMPTS(quizId), {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch quiz attempts');
      }

      const data = await response.json();
      return Array.isArray(data) ? data : [data];
    } catch (error) {
      console.error('[LOG error] ========= Error fetching quiz attempts:', error instanceof Error ? error.message : String(error));
      throw error;
    }
  }
}

export const quizzesService = new QuizzesService(); 
