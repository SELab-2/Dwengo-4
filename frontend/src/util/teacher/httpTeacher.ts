import { QueryClient } from "@tanstack/react-query";
import { getAuthToken } from "./authTeacher";

const BACKEND = "http://localhost:5000";

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
  info?: any;
}

export async function loginTeacher({
  email,
  password,
}: AuthCredentials): Promise<AuthResponse> {
  const response = await fetch(`${BACKEND}/auth/teacher/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const error: APIError = new Error(
      "Er is iets misgegaan tijdens het inloggen."
    );
    error.code = response.status;
    error.info = await response.json();
    throw error;
  }

  return await response.json();
}

export async function signupTeacher({
  firstName,
  lastName,
  email,
  password,
}: AuthCredentials): Promise<AuthResponse> {
  const response = await fetch(`${BACKEND}/auth/teacher/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ firstName, lastName, email, password }),
  });

  if (!response.ok) {
    const error: APIError = new Error(
      "Er is iets misgegaan tijdens het registreren."
    );
    error.code = response.status;
    error.info = await response.json();
    throw error;
  }

  return await response.json();
}

interface ClassItem {
  id: string;
  name: string;
  code: string;
}

export async function fetchClasses(): Promise<ClassItem[]> {
  const response = await fetch(`${BACKEND}/teacher/classes`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getAuthToken()}`,
    },
  });

  if (!response.ok) {
    const error: APIError = new Error(
      "Er is iets misgegaan bij het ophalen van de klassen."
    );
    error.code = response.status;
    error.info = await response.json();
    throw error;
  }

  return await response.json();
}

interface CreateClassPayload {
  name: string;
}

export async function createClass({
  name,
}: CreateClassPayload): Promise<ClassItem> {
  const response = await fetch(`${BACKEND}/teacher/classes`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getAuthToken()}`,
    },
    body: JSON.stringify({ name }),
  });

  if (!response.ok) {
    const error: APIError = new Error(
      "Er is iets misgegaan bij het aanmaken van de klas."
    );
    error.code = response.status;
    error.info = await response.json();
    throw error;
  }

  return await response.json();
}
