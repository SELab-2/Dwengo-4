import { ClassItem } from '@/types/type';
import { apiRequest, BACKEND } from '../shared/config';
import { getAuthToken } from './authStudent';
import { APIError } from '@/types/api.types';

export async function fetchClasses(): Promise<ClassItem[]> {
  return (await apiRequest({
    method: 'GET',
    endpoint: '/class/student',
    getToken: getAuthToken,
  }) as ClassItem[]).classrooms;
}

export async function fetchClass({
  classId,
}: {
  classId: string;
}): Promise<ClassItem> {
  return await apiRequest({
    method: 'GET',
    endpoint: `/class/student/${classId}`,
    getToken: getAuthToken,
  }) as ClassItem;
}


export async function fetchLeaveClass({ classId }: { classId: string }) {
  return await apiRequest({
    method: 'DELETE',
    endpoint: `/class/student/leave/${classId}`,
    getToken: getAuthToken,
  })
}


