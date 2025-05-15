import { APIError, AuthCredentials, AuthResponse } from '@/types/api.types';
import { apiRequest } from '../shared/config';

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
  return await apiRequest({
    method: 'POST',
    endpoint: '/auth/teacher/login',
    body: { email, password },
    getToken: () => null,
  });
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
  return await apiRequest({
    method: 'POST',
    endpoint: '/auth/teacher/register',
    body: { firstName, lastName, email, password },
    getToken: () => null,
  });
}
