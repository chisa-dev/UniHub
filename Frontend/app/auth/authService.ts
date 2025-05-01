import { API_ENDPOINTS } from '@/config/apiConfig';

export interface SignupPayload {
  username: string;
  email: string;
  password: string;
  fullName: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  token: string;
  user: {
    id: string;
    username: string;
    email: string;
    full_name: string;
    avatar_url: string | null;
    role: string;
    is_active: number;
    last_login: string | null;
    created_at: string;
    updated_at: string;
  };
}

export interface SignupResponse {
  message: string;
  token: string;
  user: {
    id: string;
    username: string;
    email: string;
    full_name: string;
    avatar_url: string | null;
    role: string;
    is_active: number;
    created_at: string;
    updated_at: string;
  };
}

export interface AuthError {
  message: string;
  error?: string;
}

// Helper to check if we're on the server
const isServer = () => typeof window === 'undefined';

// Safe local storage operations
const safeLocalStorage = {
  getItem(key: string): string | null {
    if (isServer()) return null;
    try {
      return localStorage.getItem(key);
    } catch (e) {
      console.error('[LOG auth] ========= Error accessing localStorage:', e);
      return null;
    }
  },
  
  setItem(key: string, value: string): void {
    if (isServer()) return;
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      console.error('[LOG auth] ========= Error setting localStorage:', e);
    }
  },
  
  removeItem(key: string): void {
    if (isServer()) return;
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.error('[LOG auth] ========= Error removing from localStorage:', e);
    }
  }
};

export const authService = {
  async signup(payload: SignupPayload): Promise<SignupResponse> {
    try {
      if (isServer()) {
        throw new Error('Cannot sign up on server side');
      }
      
      const response = await fetch(API_ENDPOINTS.AUTH.SIGNUP, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw data;
      }
      
      // Store token in localStorage for future requests
      if (data.token) {
        safeLocalStorage.setItem('token', data.token);
        safeLocalStorage.setItem('user', JSON.stringify(data.user));
      }
      
      return data;
    } catch (error) {
      console.error('[LOG auth] ========= Signup error:', error);
      throw error;
    }
  },

  async login(payload: LoginPayload): Promise<LoginResponse> {
    try {
      if (isServer()) {
        throw new Error('Cannot login on server side');
      }
      
      const response = await fetch(API_ENDPOINTS.AUTH.LOGIN, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw data;
      }
      
      // Store token in localStorage for future requests
      if (data.token) {
        safeLocalStorage.setItem('token', data.token);
        safeLocalStorage.setItem('user', JSON.stringify(data.user));
      }
      
      return data;
    } catch (error) {
      console.error('[LOG auth] ========= Login error:', error);
      throw error;
    }
  },

  logout() {
    safeLocalStorage.removeItem('token');
    safeLocalStorage.removeItem('user');
  },

  isAuthenticated(): boolean {
    return Boolean(safeLocalStorage.getItem('token'));
  },

  getToken(): string | null {
    return safeLocalStorage.getItem('token');
  },

  getUser(): any {
    const user = safeLocalStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },
}; 