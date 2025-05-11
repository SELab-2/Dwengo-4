import { LearningPath } from '@/types/type';
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
  })) as { learningPaths: LearningPath[] };

  return response
    .map((path: any) => ({
      ...path,
      id: path._id || path.id,
    }))
    .sort((a: LearningPath, b: LearningPath) =>
      a.title.localeCompare(b.title),
    ) as LearningPath[];
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
  return (await apiRequest({
    method: 'GET',
    endpoint: `/learningpath/${learningPathId}`,
    getToken: getAuthToken,
  })) as { learningPath: LearningPath };
}

/**
 * Fetches all learning objects for a specific learning path
 * @param {string} pathId - The ID of the learning path
 * @returns {Promise<any>} List of learning objects
 * @throws {APIError} When fetching fails
 */
export async function fetchLearningObjectsByLearningPath(
  pathId: string,
): Promise<any> {
  return (await apiRequest({
    method: 'GET',
    endpoint: `/learningObject/learningPath/${pathId}`,
    getToken: getAuthToken,
  })) as { learningObjects: any[] };
}
