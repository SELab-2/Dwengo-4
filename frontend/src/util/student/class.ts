import { ClassItem } from '@/types/type';
import { apiRequest } from '../shared/config';
import { getAuthToken } from './authStudent';

export async function fetchClasses(): Promise<ClassItem[]> {
  return (
    (await apiRequest({
      method: 'GET',
      endpoint: '/class/student',
      getToken: getAuthToken,
    })) as ClassItem[]
  ).classrooms;
}

export async function fetchClass({
  classId,
}: {
  classId: string;
}): Promise<ClassItem> {
  return (await apiRequest({
    method: 'GET',
    endpoint: `/class/student/${classId}`,
    getToken: getAuthToken,
  })) as ClassItem;
}

export async function fetchLeaveClass({ classId }: { classId: string }) {
  return await apiRequest({
    method: 'DELETE',
    endpoint: `/class/student/leave/${classId}`,
    getToken: getAuthToken,
  });
}
