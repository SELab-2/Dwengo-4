import { QueryClient } from '@tanstack/react-query';
import { getAuthToken } from './authTeacher';
import {
  AssignmentPayload,
  ClassItem,
  LearningPath,
  Team,
  TeamAssignment,
} from '../../types/type';

const BACKEND = 'http://localhost:5000';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
    },
  },
});

interface AuthCredentials {
  firstName?: string;
  lastName?: string;
  email: string;
  password: string;
}

interface AuthResponse {
  token: string;
}

interface APIError extends Error {
  code?: number;
  info?: any;
}

/**
 * Authenticates a teacher with email and password
 * @param {AuthCredentials} credentials - The login credentials
 * @returns {Promise<AuthResponse>} The authentication token
 * @throws {APIError} When login fails
 */
export async function loginTeacher({
  email,
  password,
}: AuthCredentials): Promise<AuthResponse> {
  const response = await fetch(`${BACKEND}/auth/teacher/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const error: APIError = new Error(
      'Er is iets misgegaan tijdens het inloggen.',
    );
    error.code = response.status;
    error.info = await response.json();
    throw error;
  }

  return await response.json();
}

/**
 * Registers a new teacher account
 * @param {AuthCredentials} credentials - The registration details
 * @returns {Promise<AuthResponse>} The authentication token
 * @throws {APIError} When registration fails
 */
export async function signupTeacher({
  firstName,
  lastName,
  email,
  password,
}: AuthCredentials): Promise<AuthResponse> {
  const response = await fetch(`${BACKEND}/auth/teacher/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ firstName, lastName, email, password }),
  });

  if (!response.ok) {
    const error: APIError = new Error(
      'Er is iets misgegaan tijdens het registreren.',
    );
    error.code = response.status;
    error.info = await response.json();
    throw error;
  }

  return await response.json();
}

/**
 * Fetches all classes for the authenticated teacher
 * @param {boolean} includeStudents - Whether to include student details
 * @returns {Promise<ClassItem[]>} List of classes
 * @throws {APIError} When fetching fails
 */
export async function fetchClasses(
  includeStudents: boolean = false,
): Promise<ClassItem[]> {
  let response;
  if (includeStudents) {
    response = await fetch(`${BACKEND}/class/teacher/student`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getAuthToken()}`,
      },
    });
  } else {
    response = await fetch(`${BACKEND}/class/teacher`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getAuthToken()}`,
      },
    });
  }

  if (!response.ok) {
    const error: APIError = new Error(
      'Er is iets misgegaan bij het ophalen van de klassen.',
    );
    error.code = response.status;
    error.info = await response.json();
    throw error;
  }

  let classrooms = await response.json();
  classrooms = classrooms.classrooms;

  if (includeStudents) {
    classrooms.forEach((classroom: any) => {
      classroom.students = classroom.classLinks.map(
        (link: any) => link.student.user,
      );
    });
  }
  return classrooms;
}

interface CreateClassPayload {
  name: string;
}

/**
 * Creates a new class for the authenticated teacher
 * @param {CreateClassPayload} payload - The class details
 * @returns {Promise<ClassItem>} The created class
 * @throws {APIError} When creation fails
 */
export async function createClass({
  name,
}: CreateClassPayload): Promise<ClassItem> {
  const response = await fetch(`${BACKEND}/class/teacher`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getAuthToken()}`,
    },
    body: JSON.stringify({ name }),
  });

  if (!response.ok) {
    const error: APIError = new Error(
      'Er is iets misgegaan bij het aanmaken van de klas.',
    );
    error.code = response.status;
    error.info = await response.json();
    throw error;
  }

  return await response.json();
}

export interface UpdateClassPayload {
  name: string;
  classId: number;
}

/**
 * Updates an existing class
 * @param {UpdateClassPayload} payload - The updated class details
 * @returns {Promise<ClassItem>} The updated class
 * @throws {APIError} When update fails
 */
export async function updateClass({
  name,
  classId,
}: UpdateClassPayload): Promise<ClassItem> {
  const response = await fetch(`${BACKEND}/class/teacher/${classId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getAuthToken()}`,
    },
    body: JSON.stringify({ name }),
  });

  if (!response.ok) {
    const error: APIError = new Error(
      'Er is iets misgegaan bij het updaten van de klas.',
    );
    error.code = response.status;
    error.info = await response.json();
    throw error;
  }

  return await response.json();
}

/**
 * Fetches a specific class by ID
 * @param {number} classId - The ID of the class
 * @returns {Promise<ClassItem>} The class details
 * @throws {APIError} When fetching fails
 */
export async function fetchClass({
  classId,
}: {
  classId: number;
}): Promise<ClassItem> {
  const response = await fetch(`${BACKEND}/class/teacher/${classId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getAuthToken()}`,
    },
  });

  if (!response.ok) {
    const error: APIError = new Error(
      'Er is iets misgegaan bij het ophalen van de klas.',
    );
    error.code = response.status;
    error.info = await response.json();
    throw error;
  }
  let classroom = await response.json();
  classroom = classroom.classroom;
  return classroom;
}

interface StudentItem {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

/**
 * Fetches all students in a specific class
 * @param {number} classId - The ID of the class
 * @returns {Promise<StudentItem[]>} List of students
 * @throws {APIError} When fetching fails
 */
export async function fetchStudentsByClass({
  classId,
}: {
  classId: number;
}): Promise<StudentItem[]> {
  const response = await fetch(`${BACKEND}/class/teacher/${classId}/student`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getAuthToken()}`,
    },
  });

  if (!response.ok) {
    const error: APIError = new Error(
      'Er is iets misgegaan bij het ophalen van de studenten.',
    );
    error.code = response.status;
    error.info = await response.json();
    throw error;
  }

  let students = await response.json();
  students = students.students;
  return students;
}

/**
 * Fetches all learning paths for the authenticated teacher
 * @returns {Promise<LearningPath[]>} List of learning paths
 * @throws {APIError} When fetching fails
 */
export async function fetchLearningPaths(): Promise<LearningPath[]> {
  const response = await fetch(`${BACKEND}/pathByTeacher/all`, {
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
  learningPaths = learningPaths.map((path: any) => ({
    ...path,
    id: path._id || path.id,
  })) as LearningPath[];

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
    `${BACKEND}/pathByTeacher/all/${learningPathId}?isExternal=${isExternal}`,
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
 * Creates a new assignment
 * @param {Object} payload - The assignment details
 * @throws {APIError} When creation fails
 */
export async function createAssignment({
  name,
  learningPathId,
  students,
  dueDate,
  description,
}: {
  name: string;
  learningPathId: string;
  students: StudentItem[];
  dueDate: string;
  description: string;
}): Promise<void> {
  const response = await fetch(`${BACKEND}/assignment/teacher`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getAuthToken()}`,
    },
    body: JSON.stringify({
      name,
      learningPathId,
      students: students.map((student) => student.id),
      dueDate,
      description,
    }),
  });

  if (!response.ok) {
    const error: APIError = new Error(
      'Er is iets misgegaan bij het aanmaken van de opdracht.',
    );
    error.code = response.status;
    error.info = await response.json();
    throw error;
  }
}

/**
 * Fetches all assignments for a class
 * @param {string} classId - The ID of the class
 * @returns {Promise<any>} List of assignments
 * @throws {APIError} When fetching fails
 */
export async function fetchAssignments(classId: string): Promise<any> {
  const response = await fetch(
    `${BACKEND}/assignment/teacher/class/${classId}`,
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
      'Er is iets misgegaan bij het ophalen van de opdrachten.',
    );
    error.code = response.status;
    error.info = await response.json();
    throw error;
  }

  const assignments = await response.json();
  return assignments;
}

/**
 * Fetches all assignments for a class
 * @param {string} classId - The ID of the class
 * @returns {Promise<any>} List of assignments
 * @throws {APIError} When fetching fails
 */
export async function fetchAllAssignments(): Promise<any> {
  const response = await fetch(`${BACKEND}/assignment/teacher?limit=5`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getAuthToken()}`,
    },
  });

  if (!response.ok) {
    const error: APIError = new Error(
      'Er is iets misgegaan bij het ophalen van de opdrachten.',
    );
    error.code = response.status;
    error.info = await response.json();
    throw error;
  }

  const assignments = await response.json();
  return assignments;
}

/**
 * Fetches a specific assignment
 * @param {string} assignmentId - The ID of the assignment
 * @param {boolean} includeClass - Whether to include class details
 * @param {boolean} includeTeams - Whether to include team details
 * @returns {Promise<AssignmentPayload>} The assignment details
 * @throws {APIError} When fetching fails
 */
export async function fetchAssignment(
  assignmentId: string,
  includeClass: boolean = false,
  includeTeams: boolean = false,
): Promise<AssignmentPayload> {
  const response = await fetch(
    `${BACKEND}/assignment/${assignmentId}?includeClass=${includeClass}&includeTeams=${includeTeams}`,
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
      'Er is iets misgegaan bij het ophalen van de opdracht.',
    );
    error.code = response.status;
    error.info = await response.json();
    throw error;
  }

  const assignment = await response.json();

  if (includeTeams && assignment.teamAssignments) {
    // Group teams by classId
    const teamsByClass: Record<string, Team[]> = {};

    assignment.teamAssignments.forEach((ta: TeamAssignment) => {
      // Extract classId from the team data
      const classId = ta.team.classId;
      if (classId) {
        if (!teamsByClass[classId]) {
          teamsByClass[classId] = [];
        }
        teamsByClass[classId].push({
          id: ta.team.id,
          students: ta.team.students.map((student) => student.user),
        });
      }
    });

    assignment.classTeams = teamsByClass;
  }

  return assignment;
}

/**
 * Deletes an assignment
 * @param {number} assignmentId - The ID of the assignment to delete
 * @throws {APIError} When deletion fails
 */
export async function deleteAssignment(assignmentId: number): Promise<void> {
  const response = await fetch(
    `${BACKEND}/assignment/teacher/${assignmentId}`,
    {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getAuthToken()}`,
      },
    },
  );

  if (!response.ok) {
    const error: APIError = new Error(
      'Er is iets misgegaan bij het verwijderen van de opdracht.',
    );
    error.code = response.status;
    error.info = await response.json();
    throw error;
  }
}

/**
 * Creates a new group assignment
 * @param {AssignmentPayload} payload - The assignment details
 * @throws {APIError} When creation fails
 */
export async function postAssignment({
  title,
  description,
  pathLanguage,
  isExternal,
  deadline,
  pathRef,
  classTeams,
  teamSize,
}: AssignmentPayload): Promise<void> {
  // Create group assignment with teams
  const response = await fetch(`${BACKEND}/assignment/teacher/team`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getAuthToken()}`,
    },
    body: JSON.stringify({
      title,
      description,
      deadline,
      pathRef: pathRef,
      pathLanguage: pathLanguage, // default language
      isExternal: isExternal,
      classTeams: classTeams,
      teamSize,
    }),
  });

  if (!response.ok) {
    const error: APIError = new Error(
      'Er is iets misgegaan bij het aanmaken van de groepsopdracht.',
    );
    error.code = response.status;
    error.info = await response.json();
    throw error;
  }
}

/**
 * Updates an existing group assignment
 * @param {AssignmentPayload} payload - The updated assignment details
 * @throws {APIError} When update fails
 */
export async function updateAssignment({
  id,
  title,
  description,
  pathLanguage,
  isExternal,
  deadline,
  pathRef,
  classTeams,
  teamSize,
}: AssignmentPayload): Promise<void> {
  // Create group assignment with teams
  const response = await fetch(`${BACKEND}/assignment/teacher/team/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getAuthToken()}`,
    },
    body: JSON.stringify({
      title,
      description,
      deadline,
      pathRef: pathRef,
      pathLanguage: pathLanguage, // default language
      isExternal: isExternal,
      classTeams: classTeams,
      teamSize,
    }),
  });

  if (!response.ok) {
    const error: APIError = new Error(
      'Er is iets misgegaan bij het aanmaken van de groepsopdracht.',
    );
    error.code = response.status;
    error.info = await response.json();
    throw error;
  }
}

export interface Invite {
  inviteId: number;
  status: 'PENDING' | 'APPROVED' | 'DENIED';
  otherTeacher: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

/**
 * Haal alle pending invites voor een klas op
 * @param classId - id van de klas waarvoor de invites worden opgehaald
 * @returns Een lijst met alle invites voor de klas
 */
export async function getPendingInvitesForClass(
  classId: string,
): Promise<Invite[]> {
  const response = await fetch(`${BACKEND}/invite/class/${classId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getAuthToken()}`,
    },
  });

  if (!response.ok) {
    const error: APIError = new Error(
      'Er is iets misgegaan bij het ophalen van de invites.',
    );
    error.code = response.status;
    error.info = await response.json();
    throw error;
  }
  const data = await response.json();
  return data.invites;
}

/**
 * Creëer een invite om een leerkracht uit te nodigen voor een klas
 * @param classId - id van de klas waaraan de leerkracht wordt uitgenodigd
 * @param otherTeacherEmail - e-mail van de leerkracht die wordt uitgenodigd
 * @returns De aangemaakte invite
 */
export async function createInvite({
  classId,
  otherTeacherEmail,
}: {
  classId: string;
  otherTeacherEmail: string;
}): Promise<Invite> {
  const response = await fetch(`${BACKEND}/invite/class/${classId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getAuthToken()}`,
    },
    body: JSON.stringify({ otherTeacherEmail }),
  });

  if (!response.ok) {
    const error: APIError = new Error(
      'Er is iets misgegaan tijdens het uitnodigen.',
    );
    error.code = response.status;
    error.info = await response.json();
    throw error;
  }
  const data = await response.json();
  return data.invite;
}

/**
 * Haal student join requests voor een klas op
 * @param classId - id van de klas waarvoor de join requests worden opgehaald
 * @returns Een lijst met join requests
 */
export async function fetchJoinRequests(classId: string): Promise<any> {
  const response = await fetch(
    `${BACKEND}/join-request/teacher/class/${classId}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getAuthToken()}`,
      },
    },
  );
  if (!response.ok) {
    const error = new Error(
      'Er is iets misgegaan bij het ophalen van de join requests.',
    );
    throw error;
  }
  return await response.json();
}

/**
 * Approve een join request
 * @param classId - id van de klas
 * @param requestId - id van het join request
 */
export async function approveJoinRequest({
  classId,
  requestId,
}: {
  classId: string;
  requestId: number;
}): Promise<any> {
  const response = await fetch(
    `${BACKEND}/join-request/teacher/${requestId}/class/${classId}`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getAuthToken()}`,
      },
      body: JSON.stringify({ action: 'approve' }),
    },
  );
  if (!response.ok) {
    const error: APIError = new Error(
      'Er is iets misgegaan bij het approven van de join request.',
    );
    error.code = response.status;
    error.info = await response.json();
    throw error;
  }
  return await response.json();
}

/**
 * Deny een join request
 * @param classId - id van de klas
 * @param requestId - id van het join request
 */
export async function denyJoinRequest({
  classId,
  requestId,
}: {
  classId: string;
  requestId: number;
}): Promise<any> {
  const response = await fetch(
    `${BACKEND}/join-request/teacher/${requestId}/class/${classId}`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getAuthToken()}`,
      },
      body: JSON.stringify({ action: 'deny' }),
    },
  );
  if (!response.ok) {
    const error: APIError = new Error(
      'Er is iets misgegaan bij het denyen van de join request.',
    );
    error.code = response.status;
    error.info = await response.json();
    throw error;
  }
  return await response.json();
}

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
  TEXT_MARKDOWN = "text/markdown",
  IMAGE_BLOCK = "image/image-block",
  IMAGE = "image/image",
  AUDIO = "audio/mpeg",
  APPLICATION_PDF = "application/pdf",
  EXTERN = "extern",
  BLOCKLY = "BLOCKLY",
  VIDEO = "video",
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
  console.log("CREATING LOCAL LEARNING OBJECT");
  console.log(getAuthToken())
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
    console.log(error);

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
    console.log(error.info)
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

    console.log(error.info);
    throw error;
  }
  return await response.text();
}
