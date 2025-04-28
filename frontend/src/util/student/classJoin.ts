import { QueryClient } from '@tanstack/react-query';
import { getAuthToken } from './authStudent';

const BACKEND = 'http://localhost:5000';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
    },
  },
});

interface AuthCredentials {
  firstName?: string;
  lastName?: string;
  email: string;
  password: string;
}

interface AuthResponse {
  token: string;
}

interface APIError extends Error {
  code?: number;
  info?: string;
}

/**
 * Laat een student een klas joinen met een joinCode
 * @param joinCode - De unieke code van de klas
 */
export async function joinClass({
  joinCode,
}: {
  joinCode: string;
}): Promise<void> {
  const response = await fetch(`${BACKEND}/join-request/student`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getAuthToken()}`,
    },
    body: JSON.stringify({ joinCode }),
  });

  if (!response.ok) {
    const error: APIError = new Error(
      'Er is iets misgegaan bij het joinen van de klas.',
    );
    error.code = response.status;
    error.info = await response.json();

    console.log(error.info);
    throw error;
  }
}

export interface ClassItem {
  id: string;
  name: string;
}

export interface AssignmentItem {
  id: string;
  title: string;
  description: string;
  deadline: string;
}




export async function fetchLeaveClass({ classId }: { classId: string }) {
  const response = await fetch(`${BACKEND}/class/student/${classId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  });

  return response;
}
