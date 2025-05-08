import { apiRequest, BACKEND } from '../shared/config';
import { APIError, AuthCredentials, AuthResponse } from '@/types/api.types';

export async function loginStudent({
    email,
    password,
}: AuthCredentials): Promise<AuthResponse> {
    return await apiRequest({
        method: 'POST',
        endpoint: '/auth/student/login',
        body: { email, password },
        getToken: () => null,
    }) as AuthResponse;
}

export async function signupStudent({
    firstName,
    lastName,
    email,
    password,
}: AuthCredentials): Promise<AuthResponse> {
    return await apiRequest({
        method: 'POST',
        endpoint: '/auth/student/register',
        body: { firstName, lastName, email, password },
        getToken: () => null,
    }) as AuthResponse;
}
