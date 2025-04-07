import { APIError, AssignmentItem } from '@/types/api.types';
import { getAuthToken } from './authStudent';
import { BACKEND } from './config';

export async function fetchAssignments(): Promise<AssignmentItem[]> {
  const response = await fetch(`${BACKEND}/assignment/student`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getAuthToken()}`,
    },
  });

  if (!response.ok) {
    const error: APIError = new Error(
      'Er is iets misgegaan bij het ophalen van de opdrachten.',
    );
    error.code = response.status;
    error.info = await response.json();
    throw error;
  }

  const assignments = await response.json();
  console.log('GETTING ASSIGNMENTS', assignments);

  return assignments;
}

export async function fetchAssignmentsForClass({
  classId,
}: {
  classId: string;
}): Promise<AssignmentItem[]> {
  const response = await fetch(
    `${BACKEND}/assignment/student/class/${classId}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getAuthToken()}`,
      },
    },
  );

  if (!response.ok) {
    const error: APIError = new Error(
      'Er is iets misgegaan bij het ophalen van de opdrachten.',
    );
    error.code = response.status;
    error.info = await response.json();
    throw error;
  }

  const assignments = await response.json();
  console.log('GETTING ASSIGNMENTS', assignments);

  return assignments;
}
