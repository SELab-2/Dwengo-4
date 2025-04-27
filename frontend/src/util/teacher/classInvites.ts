import { QueryClient } from '@tanstack/react-query';
import { getAuthToken } from './authTeacher';
import {
  AssignmentPayload,
  ClassItem,
  LearningPath,
  Team,
  TeamAssignment,
} from '../../types/type';
import { APIError } from '@/types/api.types';

const BACKEND = 'http://localhost:5000';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
    },
  },
});



export interface Invite {
  inviteId: number;
  status: 'PENDING' | 'APPROVED' | 'DENIED';
  otherTeacher: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

/**
 * Haal alle pending invites voor een klas op
 * @param classId - id van de klas waarvoor de invites worden opgehaald
 * @returns Een lijst met alle invites voor de klas
 */
export async function getPendingInvitesForClass(
  classId: string,
): Promise<Invite[]> {
  const response = await fetch(`${BACKEND}/invite/class/${classId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getAuthToken()}`,
    },
  });

  if (!response.ok) {
    const error: APIError = new Error(
      'Er is iets misgegaan bij het ophalen van de invites.',
    );
    error.code = response.status;
    error.info = await response.json();
    throw error;
  }
  const data = await response.json();
  return data.invites;
}

/**
 * Creëer een invite om een leerkracht uit te nodigen voor een klas
 * @param classId - id van de klas waaraan de leerkracht wordt uitgenodigd
 * @param otherTeacherEmail - e-mail van de leerkracht die wordt uitgenodigd
 * @returns De aangemaakte invite
 */
export async function createInvite({
  classId,
  otherTeacherEmail,
}: {
  classId: string;
  otherTeacherEmail: string;
}): Promise<Invite> {
  const response = await fetch(`${BACKEND}/invite/class/${classId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getAuthToken()}`,
    },
    body: JSON.stringify({ otherTeacherEmail }),
  });

  if (!response.ok) {
    const error: APIError = new Error(
      'Er is iets misgegaan tijdens het uitnodigen.',
    );
    error.code = response.status;
    error.info = await response.json();
    throw error;
  }
  const data = await response.json();
  return data.invite;
}

/**
 * Haal student join requests voor een klas op
 * @param classId - id van de klas waarvoor de join requests worden opgehaald
 * @returns Een lijst met join requests
 */
export async function fetchJoinRequests(classId: string): Promise<any> {
  const response = await fetch(
    `${BACKEND}/join-request/teacher/class/${classId}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getAuthToken()}`,
      },
    },
  );
  if (!response.ok) {
    const error = new Error(
      'Er is iets misgegaan bij het ophalen van de join requests.',
    );
    throw error;
  }
  return await response.json();
}

/**
 * Approve een join request
 * @param classId - id van de klas
 * @param requestId - id van het join request
 */
export async function approveJoinRequest({
  classId,
  requestId,
}: {
  classId: string;
  requestId: number;
}): Promise<any> {
  const response = await fetch(
    `${BACKEND}/join-request/teacher/${requestId}/class/${classId}`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getAuthToken()}`,
      },
      body: JSON.stringify({ action: 'approve' }),
    },
  );
  if (!response.ok) {
    const error: APIError = new Error(
      'Er is iets misgegaan bij het approven van de join request.',
    );
    error.code = response.status;
    error.info = await response.json();
    throw error;
  }
  return await response.json();
}

/**
 * Deny een join request
 * @param classId - id van de klas
 * @param requestId - id van het join request
 */
export async function denyJoinRequest({
  classId,
  requestId,
}: {
  classId: string;
  requestId: number;
}): Promise<any> {
  const response = await fetch(
    `${BACKEND}/join-request/teacher/${requestId}/class/${classId}`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getAuthToken()}`,
      },
      body: JSON.stringify({ action: 'deny' }),
    },
  );
  if (!response.ok) {
    const error: APIError = new Error(
      'Er is iets misgegaan bij het denyen van de join request.',
    );
    error.code = response.status;
    error.info = await response.json();
    throw error;
  }
  return await response.json();
}
