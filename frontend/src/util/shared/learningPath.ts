import { APIError } from '@/types/api.types';
import { LearningPath } from '../../types/type';
import { getAuthToken } from '../teacher/authTeacher';
import { BACKEND } from '../teacher/config';

/**
 * Fetches all learning paths for the authenticated teacher
 * @returns {Promise<LearningPath[]>} List of learning paths
 * @throws {APIError} When fetching fails
 */
export async function fetchLearningPaths(): Promise<LearningPath[]> {
  const response = await fetch(`${BACKEND}/learningPath?all`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getAuthToken()}`,
    },
  });

  if (!response.ok) {
    const error: APIError = new Error(
      'Er is iets misgegaan bij het ophalen van de leerpaden.',
    );
    error.code = response.status;
    error.info = await response.json();
    throw error;
  }

  let learningPaths = await response.json();
  learningPaths = learningPaths
    .map((path: any) => ({
      ...path,
      id: path._id || path.id,
    }))
    .sort((a: LearningPath, b: LearningPath) => a.title.localeCompare(b.title)) as LearningPath[];


  return learningPaths;
}

/**
 * Fetches a specific learning path
 * @param {string} learningPathId - The ID of the learning path
 * @param {boolean} isExternal - Whether the path is external
 * @returns {Promise<LearningPath>} The learning path details
 * @throws {APIError} When fetching fails
 */
export async function fetchLearningPath(
  learningPathId: string,
  isExternal: boolean = false,
): Promise<LearningPath> {
  const response = await fetch(
    `${BACKEND}/learningPath/${learningPathId}?includeProgress=true`,
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
      'Er is iets misgegaan bij het ophalen van het leerpad.',
    );
    error.code = response.status;
    error.info = await response.json();
    throw error;
  }

  const learningPath = await response.json();
  return learningPath;
}

/**
 * Fetches all learning objects for a specific learning path
 * @param {string} pathId - The ID of the learning path
 * @returns {Promise<any>} List of learning objects
 * @throws {APIError} When fetching fails
 */
export async function fetchLearningObjectsByLearningPath(pathId: string): Promise<any> {

  const response = await fetch(`${BACKEND}/learningObject/learningPath/${pathId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getAuthToken()}`,
    },
  });

  if (!response.ok) {
    const error: APIError = new Error(
      'Er is iets misgegaan bij het ophalen van de leerobjecten.',
    );
    error.code = response.status;
    error.info = await response.json();
    throw error;
  }

  return await response.json();
}
