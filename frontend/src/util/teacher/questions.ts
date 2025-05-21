import { APIError } from '@/types/api.types';
import { getAuthToken } from './authTeacher';
import { BACKEND } from '../shared/config';

export async function fetchQuestionsByClass(classId: number): Promise<any> {
  const response = await fetch(`${BACKEND}/question/class/${classId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getAuthToken()}`,
    },
  });

  if (!response.ok) {
    const error: APIError = new Error(
      'Er is iets misgegaan bij het ophalen van de vragen voor deze klas.',
    );
    error.code = response.status;
    error.info = await response.json();
    throw error;
  }

  console.log('questions for class', response);

  return await response.json();
}

export async function fetchQuestionConversation(
  questionId: string,
): Promise<any> {
  console.log('TEACHER TOKEN: ', getAuthToken());
  const response = await fetch(`${BACKEND}/question/${questionId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getAuthToken()}`,
    },
  });

  if (!response.ok) {
    const error: APIError = new Error(
      'Er is iets misgegaan bij het ophalen van de berichten.',
    );
    error.code = response.status;
    error.info = await response.json();
    throw error;
  }

  const messages = await response.json();
  console.log('messages for question', messages);
  return messages;
}

export async function addMessageToQuestion(
  questionId: string,
  content: string,
): Promise<any> {
  const response = await fetch(`${BACKEND}/question/${questionId}/message`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getAuthToken()}`,
    },
    body: JSON.stringify({ text: content }),
  });

  if (!response.ok) {
    const error: APIError = new Error(
      'Er is iets misgegaan bij het toevoegen van het bericht.',
    );
    error.code = response.status;
    error.info = await response.json();
    throw error;
  }

  return await response.json();
}

export async function getLeaderboard(): Promise<any> {
  const response = await fetch(`${BACKEND}/leaderboard`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getAuthToken()}`,
    },
  });

  if (!response.ok) {
    const error: APIError = new Error(
      'Er is iets misgegaan bij het ophalen van het scorebord.',
    );
    error.code = response.status;
    error.info = await response.json();
    throw error;
  }

  const leaderboard = await response.json();
  return leaderboard;
}
