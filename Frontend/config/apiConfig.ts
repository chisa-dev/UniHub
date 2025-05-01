const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export const API_ENDPOINTS = {
  AUTH: {
    SIGNUP: `${API_BASE_URL}/auth/signup`,
    LOGIN: `${API_BASE_URL}/auth/login`,
  },
  TOPICS: {
    LIST: `${API_BASE_URL}/topics`,
    GET: (id: string) => `${API_BASE_URL}/topics/${id}`,
    CREATE: `${API_BASE_URL}/topics`,
    UPDATE: (id: string) => `${API_BASE_URL}/topics/${id}`,
    DELETE: (id: string) => `${API_BASE_URL}/topics/${id}`,
  },
  STATISTICS: {
    GET: `${API_BASE_URL}/statistics`,
  },
  MATERIALS: {
    LIST: `${API_BASE_URL}/materials`,
    BY_TOPIC: (topicId: string) => `${API_BASE_URL}/materials/topic/${topicId}`,
    UPLOAD: `${API_BASE_URL}/materials/upload`,
  },
  // Add more endpoints as needed
};

export default API_ENDPOINTS; 