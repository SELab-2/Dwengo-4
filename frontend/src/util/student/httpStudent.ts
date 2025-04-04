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

export async function loginStudent({
  email,
  password,
}: AuthCredentials): Promise<AuthResponse> {
  const response = await fetch(`${BACKEND}/student/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const error: APIError = new Error(
      'Er is iets misgegaan tijdens het inloggen.',
    );
    error.code = response.status;
    error.info = await response.json();
    throw error;
  }

  return await response.json();
}

export async function signupStudent({
  firstName,
  lastName,
  email,
  password,
}: AuthCredentials): Promise<AuthResponse> {
  const response = await fetch(`${BACKEND}/student/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ firstName, lastName, email, password }),
  });

  if (!response.ok) {
    const error: APIError = new Error(
      'Er is iets misgegaan tijdens het registreren.',
    );
    error.code = response.status;
    error.info = await response.json();
    throw error;
  }

  return await response.json();
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
  const response = await fetch(`${BACKEND}/student/classes/join`, {
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

export async function fetchClasses(): Promise<ClassItem[]> {
  const response = await fetch(`${BACKEND}/class/student`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getAuthToken()}`,
    },
  });

  if (!response.ok) {
    const error: APIError = new Error(
      'Er is iets misgegaan bij het ophalen van de klassen.',
    );
    error.code = response.status;
    error.info = await response.json();
    throw error;
  }

  const returner = await response.json();
  const classrooms = returner['classes'];
  console.log('GETTING CLASSES', classrooms);

  return classrooms;
}

export interface AssignmentItem {
  id: string;
  title: string;
  description: string;
  deadline: string;
}

export async function fetchAssignments(): Promise<AssignmentItem[]> {
  const response = await fetch(`${BACKEND}/assignment/student`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getAuthToken()}`,
    },
  });

  if (!response.ok) {
    const error: APIError = new Error(
      'Er is iets misgegaan bij het ophalen van de opdrachten.',
    );
    error.code = response.status;
    error.info = await response.json();
    throw error;
  }

  const assignments = await response.json();
  console.log('GETTING ASSIGNMENTS', assignments);

  return assignments;
}
