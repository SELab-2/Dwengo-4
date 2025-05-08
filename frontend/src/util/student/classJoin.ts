import { QueryClient } from '@tanstack/react-query';
import { getAuthToken } from './authStudent';
import { APIError } from '@/types/api.types';
import { apiRequest } from '../shared/config';

const BACKEND = 'http://localhost:5000';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
    },
  },
});


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
