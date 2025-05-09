import { getAuthToken } from './authStudent';
import { apiRequest } from '../shared/config';

/**
 * Laat een student een klas joinen met een joinCode
 * @param joinCode - De unieke code van de klas
 */
export async function joinClass({
  joinCode,
}: {
  joinCode: string;
}): Promise<void> {
  return await apiRequest({
    method: 'POST',
    endpoint: '/join-request/student',
    body: { joinCode },
    getToken: getAuthToken,
  });
}

export async function fetchLeaveClass({ classId }: { classId: string }) {
  return await apiRequest({
    method: 'DELETE',
    endpoint: `/class/student/leave/${classId}`,
    getToken: getAuthToken,
  });
}
