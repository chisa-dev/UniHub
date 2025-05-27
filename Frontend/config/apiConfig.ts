const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export const API_ENDPOINTS = {
  AUTH: {
    SIGNUP: `${API_BASE_URL}/auth/signup`,
    LOGIN: `${API_BASE_URL}/auth/login`,
    FORGOT_PASSWORD: `${API_BASE_URL}/auth/forgot-password`,
    RESET_PASSWORD: `${API_BASE_URL}/auth/reset-password`,
    VALIDATE_RESET_TOKEN: (token: string) => `${API_BASE_URL}/auth/validate-reset-token/${token}`,
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
    QUIZ_PERFORMANCE: `${API_BASE_URL}/statistics/quiz-performance`,
    NOTE_PROGRESS: `${API_BASE_URL}/statistics/note-progress`,
    STUDY_SESSIONS: `${API_BASE_URL}/statistics/study-sessions`,
    UPDATE_TOPIC_PROGRESS: `${API_BASE_URL}/statistics/topics`,
    UPDATE_QUIZ_PROGRESS: `${API_BASE_URL}/statistics/quizzes`,
    UPDATE_NOTE_PROGRESS: `${API_BASE_URL}/statistics/notes`,
    LOG_STUDY_SESSION: `${API_BASE_URL}/statistics/study-sessions`,
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
    CREATE_RAG: `${API_BASE_URL}/rag/notes`,
    UPDATE: (id: string) => `${API_BASE_URL}/notes/${id}`,
    DELETE: (id: string) => `${API_BASE_URL}/notes/${id}`,
    BY_TOPIC: (topicId: string) => `${API_BASE_URL}/notes/topic/${topicId}`,
  },
  QUIZZES: {
    LIST: `${API_BASE_URL}/quizzes`,
    GET: (id: string) => `${API_BASE_URL}/quizzes/${id}`,
    CREATE: `${API_BASE_URL}/quizzes`,
    CREATE_RAG: `${API_BASE_URL}/quizzes/rag`,
    UPDATE: (id: string) => `${API_BASE_URL}/quizzes/${id}`,
    DELETE: (id: string) => `${API_BASE_URL}/quizzes/${id}`,
    BY_TOPIC: (topicId: string) => `${API_BASE_URL}/quizzes/topic/${topicId}`,
    SUBMIT_ATTEMPT: (id: string) => `${API_BASE_URL}/quizzes/${id}/attempt`,
    GET_ATTEMPTS: (id: string) => `${API_BASE_URL}/quizzes/${id}/attempts`,
  },
  
  RAG: {
    CHAT: `${API_BASE_URL}/rag/chat`,
    INDEX_TOPIC: (topicId: string) => `${API_BASE_URL}/rag/index/${topicId}`,
    DELETE_INDEX: (topicId: string) => `${API_BASE_URL}/rag/index/${topicId}`,
    SEARCH: `${API_BASE_URL}/rag/search`,
    NOTES: `${API_BASE_URL}/rag/notes`,
    INDEXED_TOPICS: `${API_BASE_URL}/rag/indexed-topics`,
    EXTRACT_MATERIAL: (materialId: string) => `${API_BASE_URL}/rag/extract/${materialId}`,
  },
  
  CALENDAR: {
    EVENTS: `${API_BASE_URL}/calendar/events`,
    CREATE_EVENT: `${API_BASE_URL}/calendar/events`,
    UPDATE_EVENT: (id: string) => `${API_BASE_URL}/calendar/events/${id}`,
    DELETE_EVENT: (id: string) => `${API_BASE_URL}/calendar/events/${id}`,
  },
  
  COLLABORATION: {
    SHARED_CONTENT: `${API_BASE_URL}/collaboration/shared-content`,
    CREATE_SHARED_CONTENT: `${API_BASE_URL}/collaboration/shared-content`,
    GET_SHARED_CONTENT: (id: string) => `${API_BASE_URL}/collaboration/shared-content/${id}`,
    UPDATE_SHARED_CONTENT: (id: string) => `${API_BASE_URL}/collaboration/shared-content/${id}`,
    DELETE_SHARED_CONTENT: (id: string) => `${API_BASE_URL}/collaboration/shared-content/${id}`,
    LIKE_CONTENT: (id: string) => `${API_BASE_URL}/collaboration/shared-content/${id}/like`,
    COMMENT_CONTENT: (id: string) => `${API_BASE_URL}/collaboration/shared-content/${id}/comments`,
  },
  // Add more endpoints as needed
};

export default API_ENDPOINTS; 