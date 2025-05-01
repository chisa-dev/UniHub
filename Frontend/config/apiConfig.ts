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
  NOTES: {
    LIST: `${API_BASE_URL}/notes`,
    GET: (id: string) => `${API_BASE_URL}/notes/${id}`,
    CREATE: `${API_BASE_URL}/notes`,
    UPDATE: (id: string) => `${API_BASE_URL}/notes/${id}`,
    DELETE: (id: string) => `${API_BASE_URL}/notes/${id}`,
    BY_TOPIC: (topicId: string) => `${API_BASE_URL}/notes/topic/${topicId}`,
  },
  QUIZZES: {
    LIST: `${API_BASE_URL}/quizzes`,
    GET: (id: string) => `${API_BASE_URL}/quizzes/${id}`,
    CREATE: `${API_BASE_URL}/quizzes`,
    UPDATE: (id: string) => `${API_BASE_URL}/quizzes/${id}`,
    DELETE: (id: string) => `${API_BASE_URL}/quizzes/${id}`,
    BY_TOPIC: (topicId: string) => `${API_BASE_URL}/quizzes/topic/${topicId}`,
  },
  ASSISTANCE: {
    SEND_MESSAGE: `${API_BASE_URL}/assistance/chat`,
    GET_TOPIC_FILES: (topicId: string) => `${API_BASE_URL}/assistance/files/${topicId}`,
  },
  CALENDAR: {
    GET_EVENTS: `${API_BASE_URL}/calendar/events`,
    CREATE_EVENT: `${API_BASE_URL}/calendar/events`,
    UPDATE_EVENT: (id: string) => `${API_BASE_URL}/calendar/events/${id}`,
    DELETE_EVENT: (id: string) => `${API_BASE_URL}/calendar/events/${id}`,
  },
  // Add more endpoints as needed
};

export default API_ENDPOINTS; 