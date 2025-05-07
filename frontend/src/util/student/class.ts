import { ClassItem } from '@/types/type';
import { BACKEND } from '../shared/config';
import { getAuthToken } from './authStudent';
import { APIError } from '@/types/api.types';

export async function fetchClasses(): Promise<ClassItem[]> {
  const response = await fetch(`${BACKEND}/class/student`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getAuthToken()}`,
    },
  });

  if (!response.ok) {
    const error: APIError = new Error(
      'Er is iets misgegaan bij het ophalen van de klassen.',
    );
    error.code = response.status;
    error.info = await response.json();
    throw error;
  }

  const returner = await response.json();
  const classrooms = returner['classrooms'];
  console.log('GETTING CLASSES', classrooms);

  return classrooms;
}

export async function fetchClass({
  classId,
}: {
  classId: string;
}): Promise<ClassItem> {
  const response = await fetch(`${BACKEND}/class/student/${classId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getAuthToken()}`,
    },
  });

  if (!response.ok) {
    const error: APIError = new Error(
      'Er is iets misgegaan bij het ophalen van de klasnaam.',
    );
    error.code = response.status;
    error.info = await response.json();
    throw error;
  }

  const classData = await response.json();
  console.log('GETTING CLASSDATA', classData);

  return classData;
}


export async function fetchLeaveClass({ classId }: { classId: string }) {
  const response = await fetch(`${BACKEND}/class/student/${classId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  });

  return response;
}


