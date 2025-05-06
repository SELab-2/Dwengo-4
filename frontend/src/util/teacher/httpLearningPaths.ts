import { DraftNode } from '@/context/LearningPathEditContext';
import {
  LearningObject,
  LearningPath,
  LearningPathNodeWithObject,
} from '../../types/type';
import { getAuthToken } from './authTeacher';
import { BACKEND } from './config';
import { APIError } from '@/types/api.types';

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

/**
 * Fetches all learning objects that the current teacher has created.
 * @returns {Promise<LearningObject[]>} The learning objects
 * @throws {APIError} When fetching fails
 */
export async function fetchLocalLearningObjects(): Promise<LearningObject[]> {
  const response = await fetch(`${BACKEND}/learningObjectByTeacher`, {
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

  return response.json();
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
  let response: Response;
  if (learningPathId) {
    // if a learning path id is provided, we update the existing learning path
    response = await fetch(`${BACKEND}/pathByTeacher/${learningPathId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getAuthToken()}`,
      },
      body: JSON.stringify({
        title: newTitle,
        description: newDescription,
        language: newLanguage,
        image: newImage,
        nodes: newNodes,
      }),
    });

    if (!response.ok) {
      const error: APIError = new Error(
        'Something went wrong when updating the learning path.',
      );
      error.code = response.status;
      error.info = await response.json();
      throw error;
    }
  } else {
    // create new learning path
    response = await fetch(`${BACKEND}/pathByTeacher`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getAuthToken()}`,
      },
      body: JSON.stringify({
        title: newTitle,
        description: newDescription,
        language: newLanguage,
        image: newImage,
        nodes: newNodes,
      }),
    });
  }

  if (!response.ok) {
    const error: APIError = new Error(
      'Er is iets misgegaan bij het ophalen van de leerobjecten.',
    );
    error.code = response.status;
    error.info = await response.json();
    throw error;
  }

  return response.json().then((data) => data.learningPath);
}
