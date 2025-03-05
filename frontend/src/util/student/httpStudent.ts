import { QueryClient } from "@tanstack/react-query";

// API backend URL (pas aan indien nodig)
const BACKEND = "http://localhost:5000";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
    },
  },
});

// ✅ Type-definities voor login- en signup-gegevens
interface AuthCredentials {
  email: string;
  password: string;
}

// ✅ Type-definitie voor de API response
interface AuthResponse {
  token: string;
}

// ✅ Type-definitie voor API-fouten
interface APIError extends Error {
  code?: number;
  info?: any;
}

// ✅ Inloggen als student
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

// ✅ Registreren als student
export async function signupStudent({
  email,
  password,
}: AuthCredentials): Promise<AuthResponse> {
  const response = await fetch(`${BACKEND}/student/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const error: APIError = new Error("Er is iets misgegaan tijdens het registreren.");
    error.code = response.status;
    error.info = await response.json();
    throw error;
  }

  return await response.json();
}
