import { LearningPath, LearningPathNodeWithObject } from '../../types/type';
import { getAuthToken } from './authTeacher';

const BACKEND = 'http://localhost:5000'; // shouldn't we be getting this from env instead?

export interface APIError extends Error {
  code?: number;
  info?: any;
}

export interface CreateLearningPathPayload {
  title: string;
  language: string;
  description?: string;
  // not sure how to upload images yet, but this could also be a param here
}

/**
 * Creates a new learning path
 * @param {CreateLearningPathPayload} payload - The payload containing the learning path details
 * @returns {Promise<LearningPath>} - The response from the API
 * @throws {APIError} - If path creation fails
 */
export async function createLearningPath({
  title,
  language,
  description,
}: CreateLearningPathPayload): Promise<LearningPath> {
  const response = await fetch(`${BACKEND}/pathByTeacher`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getAuthToken()}`,
    },
    body: JSON.stringify({
      title,
      language,
      description,
    }),
  });

  if (!response.ok) {
    const error: APIError = new Error('Failed to create learning path');
    error.code = response.status;
    error.info = response.json();
    throw error;
  }

  const data = await response.json();
  return data.learningPath;
}

/**
 * Fetches a specific local learning path
 * @param {string} learningPathId - The ID of the local learning path
 * @returns {Promise<LearningPath>} The learning path details
 * @throws {APIError} When fetching fails
 */
export async function fetchLocalLearningPath(
  learningPathId: string,
): Promise<LearningPath> {
  const response = await fetch(`${BACKEND}/pathByTeacher/${learningPathId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getAuthToken()}`,
    },
  });

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
 * Fetches all nodes within a specific local learning path
 * and also includes the learning object details for each node.
 * @param {string} learningPathId - The ID of the local learning path
 * @return {Promise<LearningPathNodeWithObject[]>} The nodes within the learning path
 * @throws {APIError} When fetching fails
 */
export async function fetchLocalLearningPathNodes(
  learningPathId: string,
): Promise<LearningPathNodeWithObject[]> {
  const response = await fetch(
    `${BACKEND}/learningPath/${learningPathId}/node`,
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
      'Er is iets misgegaan bij het ophalen van de nodes van het leerpad.',
    );
    error.code = response.status;
    error.info = await response.json();
    throw error;
  }

  return response.json();
}
