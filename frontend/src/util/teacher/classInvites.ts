import { getAuthToken } from './authTeacher';
import { Invite } from '../../types/type';

import { apiRequest, BACKEND } from '../shared/config';

/**
 * Haal alle pending invites voor een klas op
 * @param classId - id van de klas waarvoor de invites worden opgehaald
 * @returns Een lijst met alle invites voor de klas
 */
export async function getPendingInvitesForClass(
  classId: string,
): Promise<Invite[]> {
  const response = (await apiRequest({
    method: 'GET',
    endpoint: `/invite/class/${classId}`,
    getToken: getAuthToken,
  })) as { invites: Invite[] };
  return response.invites;
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
  const response = (await apiRequest({
    method: 'POST',
    endpoint: `/invite/class/${classId}`,
    body: { otherTeacherEmail },
    getToken: getAuthToken,
  })) as { invite: Invite };
  return response.invite;
}

/**
 * Haal student join requests voor een klas op
 * @param classId - id van de klas waarvoor de join requests worden opgehaald
 * @returns Een lijst met join requests
 */
export async function fetchJoinRequests(classId: string): Promise<any> {
  return (await apiRequest({
    method: 'GET',
    endpoint: `/join-request/teacher/class/${classId}`,
    getToken: getAuthToken,
  })) as { joinRequests: any[] };
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
  return (await apiRequest({
    method: 'PATCH',
    endpoint: `/join-request/teacher/${requestId}/class/${classId}`,
    body: { action: 'approve' },
    getToken: getAuthToken,
  })) as { joinRequest: any };
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
  return (await apiRequest({
    method: 'PATCH',
    endpoint: `/join-request/teacher/${requestId}/class/${classId}`,
    body: { action: 'deny' },
    getToken: getAuthToken,
  })) as { joinRequest: any };
}



/**
 * Haal alle pending invites voor de ingelogde teacher op
 * @returns Een lijst met invites
 */
export async function fetchTeacherInvites(): Promise<Invite[]> {
  const response = await fetch(`${BACKEND}/invite/`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getAuthToken()}`,
    },
  });

  if (!response.ok) {
    const error: APIError = new Error("Er is iets misgegaan bij het ophalen van de invites.");
    error.code = response.status;
    error.info = await response.json();
    throw error;
  }

  const data = await response.json();
  return data.invites;
}

/**
 * Update de status van een invite (accepteer of weiger)
 * @param inviteId - het id van de invite
 * @param action - "accept" of "decline"
 * @returns De bijgewerkte invite
 */
export async function updateInviteStatus(inviteId: number, action: "accept" | "decline"): Promise<Invite> {
  const response = await fetch(`${BACKEND}/invite/${inviteId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getAuthToken()}`,
    },
    body: JSON.stringify({ action }),
  });

  if (!response.ok) {
    const error: APIError = new Error("Er is iets misgegaan bij het bijwerken van de invite.");
    error.code = response.status;
    error.info = await response.json();
    throw error;
  }

  const data = await response.json();
  return data.invite;
}
