import { DraftNode } from '@/context/LearningPathEditContext';
import {
  LearningObject,
  LearningPath,
  LearningPathNodeWithObject,
} from '../../types/type';
import { getAuthToken } from './authTeacher';
import { apiRequest } from '../shared/config';

/**
 * Fetches a specific local learning path
 * @param {string} learningPathId - The ID of the local learning path
 * @returns {Promise<LearningPath>} The learning path details
 * @throws {APIError} When fetching fails
 */
export async function fetchLocalLearningPath(
  learningPathId: string,
): Promise<LearningPath> {
  return await apiRequest({
    method: 'GET',
    endpoint: `/pathByTeacher/${learningPathId}`,
    getToken: getAuthToken,
  });
}

/**
 * Fetches all paths created by the current teacher.
 * @returns {Promise<LearningPath[]>} The learning paths
 * @throws {APIError} When fetching fails
 */
export async function fetchOwnedLearningPaths(): Promise<LearningPath[]> {
  return await apiRequest({
    method: 'GET',
    endpoint: '/pathByTeacher',
    getToken: getAuthToken,
  });
}

/**
 * Fetches all nodes within a specific local learning path
 * and also includes the learning object details for each node.
 * @param {string} learningPathId - The ID of the local learning path
 * @return {Promise<LearningPathNodeWithObject[]>} The nodes within the learning path
 * @throws {APIError} When fetching fails
 */
export async function fetchLocalLearningPathNodes(
  learningPathId: string,
): Promise<LearningPathNodeWithObject[]> {
  return await apiRequest({
    method: 'GET',
    endpoint: `/learningPath/${learningPathId}/node`,
    getToken: getAuthToken,
  });
}

/**
 * Fetches all learning objects that the current teacher has created.
 * @returns {Promise<LearningObject[]>} The learning objects
 * @throws {APIError} When fetching fails
 */
export async function fetchOwnedLearningObjects(): Promise<LearningObject[]> {
  return await apiRequest({
    method: 'GET',
    endpoint: '/learningObjectByTeacher',
    getToken: getAuthToken,
  });
}

export interface updateOrCreateLearningPathPayload {
  newTitle: string;
  newDescription: string;
  newLanguage: string;
  newImage: string | null;
  newNodes: (LearningPathNodeWithObject | DraftNode)[];
  learningPathId?: string;
}

/**
 * updates or creates a learning path with the given title, description, language and nodes.
 * The list of nodes contains (possibly reodered) existing nodes (LearningPathNodeWithObject) and new nodes (DraftNode).
 * @param {updateOrCreateLearningPathPayload}
 * @throws {APIError}
 * @returns {Promise<LearningPath>} The updated or created learning path
 */
export async function updateOrCreateLearningPath({
  newTitle,
  newDescription,
  newLanguage,
  newImage,
  newNodes,
  learningPathId,
}: updateOrCreateLearningPathPayload): Promise<LearningPath> {
  let response: { learningPath: LearningPath };
  if (learningPathId) {
    // if a learning path id is provided, we update the existing learning path
    response = await apiRequest({
      method: 'PATCH',
      endpoint: `/pathByTeacher/${learningPathId}`,
      body: {
        title: newTitle,
        description: newDescription,
        language: newLanguage,
        image: newImage,
        nodes: newNodes,
      },
      getToken: getAuthToken,
    });
  } else {
    // create new learning path
    response = await apiRequest({
      method: 'POST',
      endpoint: `/pathByTeacher`,
      body: {
        title: newTitle,
        description: newDescription,
        language: newLanguage,
        image: newImage,
        nodes: newNodes,
      },
      getToken: getAuthToken,
    });
  }

  return response.learningPath;
}
