import { QueryClient } from "@tanstack/react-query";
//import { getAuthToken } from "./authTeacher";

// API backend URL (pas aan indien nodig)
const BACKEND = "http://localhost:5000";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
    },
  },
});

// Inloggen als leerkracht
export async function loginTeacher({ email, password }) {
  const response = await fetch(`${BACKEND}/teacher/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const error = new Error("Er is iets misgegaan tijdens het inloggen.");
    error.code = response.status;
    error.info = await response.json();
    throw error;
  }

  return await response.json();
}

// Registreren als leerkracht
export async function signupTeacher({ email, password }) {
  const response = await fetch(`${BACKEND}/teacher/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const error = new Error("Er is iets misgegaan tijdens het registreren.");
    error.code = response.status;
    error.info = await response.json();
    throw error;
  }

  return await response.json();
}
