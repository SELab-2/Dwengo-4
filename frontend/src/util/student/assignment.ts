import { AssignmentItem } from '@/types/api.types';
import { getAuthToken } from './authStudent';
import { apiRequest } from '../shared/config';

export async function fetchAssignments(): Promise<AssignmentItem[]> {
  return (await apiRequest({
    method: 'GET',
    endpoint: '/assignment/student',
    getToken: getAuthToken,
  })) as AssignmentItem[];
}

export async function fetchAssignmentsForClass({
  classId,
}: {
  classId: string;
}): Promise<AssignmentItem[]> {
  return (await apiRequest({
    method: 'GET',
    endpoint: `/assignment/student/class/${classId}`,
    getToken: getAuthToken,
  })) as AssignmentItem[];
}


