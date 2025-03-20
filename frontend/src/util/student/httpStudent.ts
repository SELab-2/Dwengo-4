import { QueryClient } from "@tanstack/react-query";


const BACKEND = "http://localhost:5000";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
    },
  },
});


interface AuthCredentials {
  firstName: string;
  lastName: string;
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


export async function loginStudent({
  email,
  password,
}: AuthCredentials): Promise<AuthResponse> {
  const response = await fetch(`${BACKEND}/student/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const error: APIError = new Error("Er is iets misgegaan tijdens het inloggen.");
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
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ firstName, lastName, email, password }),
  });

  if (!response.ok) {
    const error: APIError = new Error("Er is iets misgegaan tijdens het registreren.");
    error.code = response.status;
    error.info = await response.json();
    throw error;
  }

  return await response.json();
}
