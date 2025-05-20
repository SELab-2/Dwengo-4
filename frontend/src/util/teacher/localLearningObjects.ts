import { getAuthToken } from "./authTeacher";
import { BACKEND } from '../shared/config';
import { APIError } from "@/types/api.types";


export interface LocalLearningObjectData {
  title: string;
  description: string;
  contentType: ContentType;
  keywords?: string[];
  targetAges?: number[];
  teacherExclusive?: boolean;
  skosConcepts?: string[];
  copyright?: string;
  licence?: string;
  difficulty?: number;
  estimatedTime?: number;
  available?: boolean;
  contentLocation?: string;
  rawHtml: string;
}

export enum ContentType {
  TEXT_PLAIN = "text/plain",
  EVAL_MULTIPLE_CHOICE = "EVAL_MULTIPLE_CHOICE",
  EVAL_OPEN_QUESTION = "EVAL_OPEN_QUESTION",
}


export type LearningObjectQuestion = 'open' | 'multipleChoice';

/**
 * Representatie van een leerobject zoals teruggegeven door de API
 */
export interface LearningObject {
  id: string;
  hruid: string;
  language: string;
  title: string;
  description: string;
  contentType: ContentType;
  keywords: string[];
  targetAges: number[];
  teacherExclusive: boolean;
  skosConcepts: string[];
  copyright: string;
  licence: string;
  difficulty: number;
  estimatedTime: number;
  available: boolean;
  contentLocation: string;
  creatorId: number;
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
}


/**
 * Creates a new local learning object
 */
export async function createLocalLearningObject(
  data: LocalLearningObjectData
): Promise<LearningObject> {
  const response = await fetch(`${BACKEND}/learningObjectByTeacher`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getAuthToken()}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error: APIError = new Error('Failed to create learning object.');
    error.code = response.status;
    error.info = await response.json();

    throw error;
  }

  return await response.json();
}

/**
 * Retrieves all local learning objects for the teacher
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
    const error: APIError = new Error('Failed to fetch learning objects.');
    error.code = response.status;
    error.info = await response.json();
    throw error;
  }

  return await response.json();
}

/**
 * Retrieves a single learning object by ID
 */
export async function fetchLocalLearningObjectById(
  id: string
): Promise<LearningObject> {
  const response = await fetch(`${BACKEND}/learningObjectByTeacher/${id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getAuthToken()}`,
    },
  });

  if (!response.ok) {
    const error: APIError = new Error('Failed to fetch the learning object.');
    error.code = response.status;
    error.info = await response.json();
    throw error;
  }

  return await response.json();
}

/**
 * Updates an existing learning object
 */
export async function updateLocalLearningObject(
  id: string,
  data: Partial<LocalLearningObjectData>
): Promise<LearningObject> {
  const response = await fetch(`${BACKEND}/learningObjectByTeacher/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getAuthToken()}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error: APIError = new Error('Failed to update learning object.');
    error.code = response.status;
    error.info = await response.json();
    throw error;
  }

  return await response.json();
}

/**
 * Deletes a learning object
 */
export async function deleteLocalLearningObject(
  id: string
): Promise<void> {
  const response = await fetch(`${BACKEND}/learningObjectByTeacher/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getAuthToken()}`,
    },
  });

  if (!response.ok) {
    const error: APIError = new Error('Failed to delete learning object.');
    error.code = response.status;
    error.info = await response.json();
    throw error;
  }
}


/**
 * Haalt alleen de rawHtml op voor een bestaand leerobject.
 * @param id - de ID van het leerobject
 * @returns de HTML-content als string
 * @throws {APIError} wanneer ophalen faalt
 */
export async function fetchLocalLearningObjectHtml(id: string): Promise<string> {
  const response = await fetch(
    `${BACKEND}/learningObjectByTeacher/${id}/html`, // zorg dat je backend‐route hierop aansluit
    {
      method: 'GET',
      headers: {
        'Content-Type': 'text/plain',
        Authorization: `Bearer ${getAuthToken()}`,
      },
    }
  );
  if (!response.ok) {
    const error: APIError = new Error('Kon rawHtml niet ophalen.');
    error.code = response.status;
    error.info = await response.text();

    throw error;
  }
  return await response.text();
}