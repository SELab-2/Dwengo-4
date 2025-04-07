import { AuthCredentials, AuthResponse, APIError } from '../../types/api.types';
import { BACKEND } from './config';


/**
 * Authenticates a teacher with email and password
 * @param {AuthCredentials} credentials - The login credentials
 * @returns {Promise<AuthResponse>} The authentication token
 * @throws {APIError} When login fails
 */
export async function loginTeacher({
  email,
  password,
}: AuthCredentials): Promise<AuthResponse> {
  const response = await fetch(`${BACKEND}/auth/teacher/login`, {
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

/**
 * Registers a new teacher account
 * @param {AuthCredentials} credentials - The registration details
 * @returns {Promise<AuthResponse>} The authentication token
 * @throws {APIError} When registration fails
 */
export async function signupTeacher({
  firstName,
  lastName,
  email,
  password,
}: AuthCredentials): Promise<AuthResponse> {
  const response = await fetch(`${BACKEND}/auth/teacher/register`, {
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
