import type { ApiError } from '../types/auth';

// Base API configuration for connecting to a real backend later
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';
export const USE_MOCK_API = import.meta.env.VITE_USE_MOCK_API !== 'false'; // defaults to true unless explicitly disabled

const TOKEN_KEY = 'fieldassist_auth_token';

export const getAuthToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

export const setAuthToken = (token: string): void => {
  localStorage.setItem(TOKEN_KEY, token);
};

export const removeAuthToken = (): void => {
  localStorage.removeItem(TOKEN_KEY);
};

// Simulated network delay for realistic API async behavior
export const simulateNetworkDelay = (ms: number = 250): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

// Generic API fetch wrapper with Bearer token injection
export async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAuthToken();
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // If mock mode is enabled, API services handle mock responses directly.
  // When connecting a real backend, this fetch will call the real server:
  if (!USE_MOCK_API) {
    const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    try {
      const response = await fetch(url, { ...options, headers });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: response.statusText }));
        throw {
          message: errorData.message || 'API request failed',
          status: response.status,
        } as ApiError;
      }
      return (await response.json()) as T;
    } catch (err) {
      if ((err as ApiError).status) throw err;
      throw { message: 'Network error connecting to FieldAssist backend', status: 500 } as ApiError;
    }
  }

  throw new Error('apiFetch called directly in mock mode without handler');
}
