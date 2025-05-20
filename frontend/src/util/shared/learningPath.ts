import { LearningObject, LearningPath, Transition } from '@/types/type';
import { getTokenDuration } from '../teacher/authTeacher';
import { apiRequest } from './config';

export function getAuthToken(): string | null {
  const token = localStorage.getItem('token');

  if (!token) {
    return null;
  }

  const tokenDuration = getTokenDuration();

  if (tokenDuration < 0) {
    return 'EXPIRED';
  }

  return token;
}

/**
 * Fetches all learning paths for the authenticated teacher
 * @returns {Promise<LearningPath[]>} List of learning paths
 * @throws {APIError} When fetching fails
 */
export async function fetchLearningPaths(): Promise<LearningPath[]> {
  const response = (await apiRequest({
    method: 'GET',
    endpoint: '/learningpath?all',
    getToken: getAuthToken,
  })) as LearningPath[];

  return response
    .map((path: any) => ({
      ...path,
      id: path._id || path.id,
    }))
    .sort((a: LearningPath, b: LearningPath) => a.title.localeCompare(b.title));
}

/**
 * Fetches a specific learning path
 * @param {string} learningPathId - The ID of the learning path
 * @returns {Promise<LearningPath>} The learning path details
 * @throws {APIError} When fetching fails
 */
export async function fetchLearningPath(
  learningPathId: string,
): Promise<LearningPath> {
  return (await apiRequest({
    method: 'GET',
    endpoint: `/learningpath/${learningPathId}?includeProgress=true`,
    getToken: getAuthToken,
  })) as LearningPath;
}

/**
 * Fetches all learning objects for a specific learning path
 * @param {string} pathId - The ID of the learning path
 * @returns {Promise<LearningObject[]>} List of learning objects
 * @throws {APIError} When fetching fails
 */
export async function fetchLearningObjectsByLearningPath(
  pathId: string,
): Promise<LearningObject[]> {
  return (await apiRequest({
    method: 'GET',
    endpoint: `/learningObject/learningPath/${pathId}`,
    getToken: getAuthToken,
  })) as LearningObject[];
}

/**
 * Fetches all transitions for a specific learning path
 * @param {string} pathId - The ID of the learning path
 * @returns {Promise<Transition[]>} List of transitions
 * @throws {APIError} When fetching fails
 */
export async function fetchLearningPathTransitions(
  pathId: string,
): Promise<Transition[]> {
  return (await apiRequest({
    method: 'GET',
    endpoint: `/learningpath/${pathId}/transitions`,
    getToken: getAuthToken,
  })) as Transition[];
}