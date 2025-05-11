import { APIError } from '@/types/api.types';
import { getAuthToken } from './authStudent';
import { BACKEND } from './config';
import { ClassItem } from '@/types/type';

export async function fetchQuestionsForTeam(assignmentId: string) {
  // First fetch: Get the student's team for this assignment
  const response = await fetch(
    `${BACKEND}/team/student/assignment/${assignmentId}/studentTeam`,
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
      'Er is iets misgegaan bij het ophalen van het team.',
    );
    error.code = response.status;
    error.info = await response.json();
    throw error;
  }

  const resp = await response.json();
  console.log(resp);
  const teamId = resp.teamAssignment.teamId;

  // Second fetch: Get questions for this team
  const responseQuestion = await fetch(`${BACKEND}/question/team/${teamId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getAuthToken()}`,
    },
  });

  if (!responseQuestion.ok) {
    throw new Error('Failed to fetch questions');
  }

  const questions = await responseQuestion.json();

  console.log('questions', questions);

  return { questions: questions, teams: resp };
}

export async function fetchQuestionConversation(
  questionId: string,
): Promise<any> {
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

export async function createNewQuestion(
  assignmentId: string,
  title: string,
  text: string,
  dwengoLanguage: string,
) {
  // First fetch: Get the student's team for this assignment

  const response = await fetch(
    `${BACKEND}/team/student/assignment/${assignmentId}/studentTeam`,
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
      'Er is iets misgegaan bij het ophalen van het team.',
    );
    error.code = response.status;
    error.info = await response.json();
    throw error;
  }

  const resp = await response.json();
  const teamId = resp.teamAssignment.teamId;

  // Now create the question with team information
  const response2 = await fetch(
    `${BACKEND}/question/general/assignment/${assignmentId}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getAuthToken()}`,
      },
      body: JSON.stringify({
        teamId,
        title,
        text,
        isExternal: resp.teamAssignment.assignment.isExternal,
        pathRef: resp.teamAssignment.assignment.pathRef,
        dwengoLanguage: dwengoLanguage,
      }),
    },
  );

  if (!response2.ok) {
    const error: APIError = new Error(
      'Er is iets misgegaan bij het aanmaken van de vraag.',
    );
    error.code = response2.status;
    error.info = await response2.json();
    throw error;
  }

  return await response2.json();
}
