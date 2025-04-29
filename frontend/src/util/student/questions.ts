import { APIError } from '@/types/api.types';
import { getAuthToken } from './authStudent';
import { BACKEND } from './config';
import { ClassItem } from '@/types/type';

export async function fetchConversation(assignmentId: string) {
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

  let questions = await responseQuestion.json();

  // If no questions exist, create one
  if (Array.isArray(questions) && questions.length === 0) {
    const createQuestionResponse = await fetch(
      `${BACKEND}/question/general/assignment/${assignmentId}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getAuthToken()}`,
        },
        body: JSON.stringify({
          teamId: teamId,
          assignmentId: assignmentId,
          title: 'Team Discussion',
          type: 'GENERAL',
          text: 'text',
          pathRef: 'todo',
          isPrivate: false,
        }),
      },
    );

    if (!createQuestionResponse.ok) {
      throw new Error('Failed to create a new question for the team');
    }

    questions = createQuestionResponse.json();
  }

  return { questions: questions, teams: resp };
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
