/**
 * Auth Store - Manages user authentication state
 * Uses Zustand for state management + Secure Store for tokens
 */

import { create } from "zustand";
import * as SecureStore from "expo-secure-store";
import { api } from "@/services/api";

interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: "user" | "admin";
}

interface Subscription {
  planType: "monthly" | "yearly" | "trial";
  status: "active" | "cancelled" | "expired";
  queriesUsed: number;
  queryLimit: number;
  currentPeriodEnd?: string;
}

interface AuthState {
  user: User | null;
  subscription: Subscription | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (email: string, password: string) => Promise<boolean>;
  signup: (data: SignupData) => Promise<boolean>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  clearError: () => void;
}

interface SignupData {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

const TOKEN_KEY = "auth_token";
const REFRESH_TOKEN_KEY = "refresh_token";

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  subscription: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });

    try {
      const response = await api.post("/auth/login", { email, password });
      const { user, access_token } = response.data;

      // Store tokens securely
      try {
        await SecureStore.setItemAsync(TOKEN_KEY, access_token);
      } catch (e) {
        // SecureStore not available (web), use localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem(TOKEN_KEY, access_token);
        }
      }

      // Set authorization header for future requests
      api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;

      set({
        user: {
          id: user.user_id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          role: user.role || 'user',
        },
        subscription: null,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      return true;
    } catch (error: any) {
      let message = "Login failed";
      if (error.response?.data) {
        const data = error.response.data;
        if (typeof data.message === 'string') {
          message = data.message;
        } else if (typeof data.detail === 'string') {
          message = data.detail;
        } else if (Array.isArray(data.detail)) {
          // Handle FastAPI validation errors
          message = data.detail.map((err: any) => err.msg || JSON.stringify(err)).join(', ');
        }
      }
      set({ isLoading: false, error: message });
      return false;
    }
  },

  signup: async (data: SignupData) => {
    set({ isLoading: true, error: null });

    try {
      console.log('Signup attempt:', { email: data.email, firstName: data.firstName, lastName: data.lastName });
      const response = await api.post("/auth/signup", {
        email: data.email,
        password: data.password,
        first_name: data.firstName,
        last_name: data.lastName,
      });
      console.log('Signup response:', response.data);
      const { user, access_token } = response.data;

      // Store tokens securely
      try {
        await SecureStore.setItemAsync(TOKEN_KEY, access_token);
      } catch (e) {
        // SecureStore not available (web), use localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem(TOKEN_KEY, access_token);
        }
      }

      // Set authorization header for future requests
      api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;

      set({
        user: {
          id: user.user_id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          role: user.role || 'user',
        },
        subscription: null,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      return true;
    } catch (error: any) {
      console.error('Signup error:', error);
      console.error('Error response:', error.response?.data);
      
      let message = "Signup failed";
      if (error.response?.data) {
        const data = error.response.data;
        if (typeof data.message === 'string') {
          message = data.message;
        } else if (typeof data.detail === 'string') {
          message = data.detail;
        } else if (Array.isArray(data.detail)) {
          // Handle FastAPI validation errors
          message = data.detail.map((err: any) => err.msg || JSON.stringify(err)).join(', ');
        }
      }
      
      set({ isLoading: false, error: message });
      return false;
    }
  },

  logout: async () => {
    try {
      await api.post("/auth/logout");
    } catch (error) {
      // Ignore logout errors
    }

    // Clear authorization header
    delete api.defaults.headers.common['Authorization'];

    // Clear tokens
    try {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
      await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
    } catch (e) {
      // SecureStore not available (web), use localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
      }
    }

    set({
      user: null,
      subscription: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
  },

  checkAuth: async () => {
    set({ isLoading: true });

    try {
      // On web, SecureStore might not be available
      let token: string | null = null;
      try {
        token = await SecureStore.getItemAsync(TOKEN_KEY);
      } catch (e) {
        // SecureStore not available (web), check localStorage
        if (typeof window !== 'undefined') {
          token = localStorage.getItem(TOKEN_KEY);
        }
      }

      if (!token) {
        set({ isLoading: false, isAuthenticated: false });
        return;
      }

      // Set the token in API headers
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      // Try to verify token with server
      try {
        const response = await api.get("/auth/me");
        const userData = response.data;

        set({
          user: {
            id: userData.user_id,
            email: userData.email,
            firstName: userData.first_name,
            lastName: userData.last_name,
            role: userData.role || 'user',
          },
          subscription: null,
          isAuthenticated: true,
          isLoading: false,
        });
      } catch (apiError: any) {
        console.log('API verification failed, but keeping user logged in with stored token');
        // API call failed but token exists - keep user logged in
        // This allows offline usage or when backend is down
        set({
          user: null, // We don't have user data, but they have a token
          subscription: null,
          isAuthenticated: true, // Trust the stored token
          isLoading: false,
        });
      }
    } catch (error) {
      // Token invalid or expired
      try {
        await SecureStore.deleteItemAsync(TOKEN_KEY);
        await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
      } catch (e) {
        // SecureStore not available (web)
        if (typeof window !== 'undefined') {
          localStorage.removeItem(TOKEN_KEY);
          localStorage.removeItem(REFRESH_TOKEN_KEY);
        }
      }

      set({
        user: null,
        subscription: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },

  clearError: () => set({ error: null }),
}));

// Helper function to get token
export const getAuthToken = async (): Promise<string | null> => {
  return await SecureStore.getItemAsync(TOKEN_KEY);
};
