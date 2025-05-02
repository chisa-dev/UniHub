import { API_ENDPOINTS } from '@/config/apiConfig';

export interface Topic {
  id: string;
  title: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
  user_id?: string;
}

export interface Note {
  id: string;
  title: string;
  topic: string;
  topicId: string | null;
  date: string;
  content: string;
  readTime: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  user_goal?: string;
}

export interface NotesResponse {
  notes: Note[];
  pagination: {
    total: number;
    page: number;
    totalPages: number;
  };
}

interface CreateNoteParams {
  title: string;
  userGoal: string;
  topicId: string | null;
  isPrivate: boolean;
}

// Helper to get the auth token
const getToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
};

// Get all topics
export const getAllTopics = async (): Promise<Topic[]> => {
  try {
    const token = getToken();
    
    if (!token) {
      throw new Error('Authentication required');
    }
    
    const response = await fetch(API_ENDPOINTS.TOPICS.LIST, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch topics');
    }

    const data = await response.json();
    return data.topics || [];
  } catch (error) {
    console.error('[LOG getAllTopics] ========= Error fetching topics:', error);
    throw error;
  }
};

// Get all notes
export const getAllNotes = async (page = 1, limit = 10): Promise<NotesResponse> => {
  try {
    const token = getToken();
    
    if (!token) {
      throw new Error('Authentication required');
    }
    
    const response = await fetch(`${API_ENDPOINTS.NOTES.LIST}?page=${page}&limit=${limit}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch notes');
    }

    return await response.json();
  } catch (error) {
    console.error('[LOG getAllNotes] ========= Error fetching notes:', error);
    throw error;
  }
};

// Get note by ID
export const getNoteById = async (noteId: string): Promise<Note> => {
  try {
    const token = getToken();
    
    if (!token) {
      throw new Error('Authentication required');
    }
    
    const response = await fetch(API_ENDPOINTS.NOTES.GET(noteId), {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch note');
    }

    return await response.json();
  } catch (error) {
    console.error('[LOG getNoteById] ========= Error fetching note:', error);
    throw error;
  }
};

// Create a new note using RAG
export const createNoteWithRAG = async (noteData: CreateNoteParams): Promise<{ message: string; note: Note }> => {
  try {
    const token = getToken();
    
    if (!token) {
      throw new Error('Authentication required');
    }
    
    const response = await fetch(API_ENDPOINTS.NOTES.CREATE_RAG, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(noteData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to create note');
    }

    return await response.json();
  } catch (error) {
    console.error('[LOG createNoteWithRAG] ========= Error creating note with RAG:', error);
    throw error;
  }
};

// Delete a note
export const deleteNote = async (noteId: string): Promise<void> => {
  try {
    const token = getToken();
    
    if (!token) {
      throw new Error('Authentication required');
    }
    
    const response = await fetch(API_ENDPOINTS.NOTES.DELETE(noteId), {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to delete note');
    }
  } catch (error) {
    console.error('[LOG deleteNote] ========= Error deleting note:', error);
    throw error;
  }
}; 