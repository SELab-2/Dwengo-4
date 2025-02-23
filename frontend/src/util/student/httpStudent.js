import { QueryClient } from "@tanstack/react-query";
import { getAuthToken } from "./authStudent";

// API backend URL (pas aan indien nodig)
const BACKEND = "http://localhost:5000";

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: 1,
        },
    },
});

// Inloggen als student
export async function loginStudent({ email, password }) {
    const response = await fetch(`${BACKEND}/student/auth/login`, {
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

// Registreren als student
export async function signupStudent({ email, password }) {
    const response = await fetch(`${BACKEND}/student/auth/register`, {
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
