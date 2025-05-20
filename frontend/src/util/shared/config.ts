import { QueryClient } from '@tanstack/react-query';
import { APIError } from '@/types/api.types';

export const BACKEND = import.meta.env.VITE_API_URL;

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
    },
  },
});

export interface RequestConfig {
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE' | 'PUT';
  endpoint: string;
  body?: any;
  getToken: () => string | null;
}

export async function apiRequest<T>({
  method,
  endpoint,
  body,
  getToken,
}: RequestConfig): Promise<T> {
  const response = await fetch(`${BACKEND}${endpoint}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const error: APIError = new Error('Er is iets misgegaan bij de aanvraag.');
    error.code = response.status;
    error.info = await response.json();
    throw error;
  }

  if (response.status === 204) {
    return {} as T; // otherwise, an error is thrown when trying to parse the response
  }

  return response.json();
}
