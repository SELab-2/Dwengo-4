import { AssignmentPayload, Team, TeamAssignment } from '../../types/type';
import { APIError, StudentItem } from '../../types/api.types';
import { BACKEND } from './config';
import { getAuthToken } from './authTeacher';

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
