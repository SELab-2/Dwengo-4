import { getAuthToken } from './authTeacher';
import { APIError, Invite } from '@/types/api.types';

import { apiRequest, BACKEND } from '../shared/config';
import { AwardIcon } from 'lucide-react';

/**
 * Haal alle pending invites voor een klas op
 * @param classId - id van de klas waarvoor de invites worden opgehaald
 * @returns Een lijst met alle invites voor de klas
 */
export async function getPendingInvitesForClass(
  classId: string,
): Promise<Invite[]> {

  const response = await apiRequest({
    method: 'GET',
    endpoint: `/invite/class/${classId}`,
    getToken: getAuthToken,
  }) as { invites: Invite[] };
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
  const response = await apiRequest({
    method: 'POST',
    endpoint: `/invite/class/${classId}`,
    body: { otherTeacherEmail },
    getToken: getAuthToken,
  }) as { invite: Invite };
  return response.invite;
}

/**
 * Haal student join requests voor een klas op
 * @param classId - id van de klas waarvoor de join requests worden opgehaald
 * @returns Een lijst met join requests
 */
export async function fetchJoinRequests(classId: string): Promise<any> {

  return await apiRequest({
    method: 'GET',
    endpoint: `/join-request/teacher/class/${classId}`,
    getToken: getAuthToken,
  }) as { joinRequests: any[] };
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

  return await apiRequest({
    method: 'PATCH',
    endpoint: `/join-request/teacher/${requestId}/class/${classId}`,
    body: { action: 'approve' },
    getToken: getAuthToken,
  }) as { joinRequest: any };
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

  return await apiRequest({
    method: 'PATCH',
    endpoint: `/join-request/teacher/${requestId}/class/${classId}`,
    body: { action: 'deny' },
    getToken: getAuthToken,
  }) as { joinRequest: any };
}
