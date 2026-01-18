/**
 * API Service - Axios instance with auth interceptors
 */

import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import Constants from "expo-constants";

// Check if running in development
const isDev = Constants.expoConfig?.extra?.isDev ?? __DEV__ ?? false;

// API base URL - change this for different environments
const getBaseUrl = () => {
  // Use environment variable if available
  const envUrl = Constants.expoConfig?.extra?.apiUrl;
  if (envUrl) return envUrl;
  
  if (isDev) {
    // Development
    if (Platform.OS === "android") {
      return "http://10.0.2.2:8000/api"; // Android emulator
    }
    return "http://localhost:8000/api"; // iOS / Web
  }
  // Production - update this with your Render backend URL
  return "https://juridikai-1.onrender.com/api";
};

export const api = axios.create({
  baseURL: getBaseUrl(),
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor - add auth token
api.interceptors.request.use(
  async (config) => {
    let token = null;
    try {
      if (Platform.OS === 'web') {
        // Use localStorage on web
        token = typeof window !== 'undefined' ? localStorage.getItem("auth_token") : null;
      } else {
        // Use SecureStore on mobile
        token = await SecureStore.getItemAsync("auth_token");
      }
    } catch (e) {
      console.error('Error getting token:', e);
    }
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle errors & token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If 401 and we haven't tried to refresh yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        let refreshToken = null;
        if (Platform.OS === 'web') {
          refreshToken = typeof window !== 'undefined' ? localStorage.getItem("refresh_token") : null;
        } else {
          refreshToken = await SecureStore.getItemAsync("refresh_token");
        }
        
        if (!refreshToken) throw new Error("No refresh token");

        const response = await axios.post(`${getBaseUrl()}/auth/refresh`, {
          refreshToken,
        });

        const { accessToken } = response.data;
        
        if (Platform.OS === 'web') {
          if (typeof window !== 'undefined') {
            localStorage.setItem("auth_token", accessToken);
          }
        } else {
          await SecureStore.setItemAsync("auth_token", accessToken);
        }

        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed - logout user
        if (Platform.OS === 'web') {
          if (typeof window !== 'undefined') {
            localStorage.removeItem("auth_token");
            localStorage.removeItem("refresh_token");
          }
        } else {
          await SecureStore.deleteItemAsync("auth_token");
          await SecureStore.deleteItemAsync("refresh_token");
        }

        // Redirect to login will happen via auth state change
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Helper types for API responses
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface ApiError {
  message: string;
  code?: string;
  details?: Record<string, string>;
}

export default api;
