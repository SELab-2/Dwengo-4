import { BACKEND } from '../shared/config';
import { APIError, AuthCredentials, AuthResponse } from '@/types/api.types';

export async function loginStudent({
    email,
    password,
}: AuthCredentials): Promise<AuthResponse> {
    const response = await fetch(`${BACKEND}/auth/student/login`, {
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
    const response = await fetch(`${BACKEND}/auth/student/register`, {
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
