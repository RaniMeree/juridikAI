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

      set({
        user,
        subscription: null,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      return true;
    } catch (error: any) {
      const message = error.response?.data?.message || "Login failed";
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

      set({
        user,
        subscription: null,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      return true;
    } catch (error: any) {
      console.error('Signup error:', error);
      console.error('Error response:', error.response?.data);
      const message = error.response?.data?.message || error.response?.data?.detail || "Signup failed";
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

      // Verify token with server (will fail if no backend)
      try {
        const response = await api.get("/auth/me");
        const { user, subscription } = response.data;

        set({
          user,
          subscription,
          isAuthenticated: true,
          isLoading: false,
        });
      } catch (apiError) {
        // API call failed (no backend), treat as not authenticated
        set({
          user: null,
          subscription: null,
          isAuthenticated: false,
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
