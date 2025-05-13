import { AssignmentPayload, Team, TeamAssignment } from '@/types/type';
import { APIError } from '@/types/api.types';
import { apiRequest, BACKEND } from '../shared/config';
import { getAuthToken } from './authTeacher';
import { Assignment } from '@prisma/client';
/**
 * Fetches all assignments for a class
 * @param {string} classId - The ID of the class
 * @returns {Promise<any>} List of assignments
 * @throws {APIError} When fetching fails
 */
export async function fetchAssignments(classId: string): Promise<any> {
  return await apiRequest({
    method: 'GET',
    endpoint: `/assignment/teacher/class/${classId}`,
    getToken: getAuthToken,
  });
}

/**
 * Fetches all assignments for a class
 * @param {string} classId - The ID of the class
 * @returns {Promise<any>} List of assignments
 * @throws {APIError} When fetching fails
 */
export async function fetchAllAssignments(): Promise<any> {
  return await apiRequest({
    method: 'GET',
    endpoint: `/assignment/teacher?limit=5`,
    getToken: getAuthToken,
  });
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
): Promise<Assignment> {
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

  const assignment: any = await apiRequest({
    method: 'GET',
    endpoint: `/assignment/${assignmentId}?includeClass=${includeClass}&includeTeams=${includeTeams}`,
    getToken: getAuthToken,
  });

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
  return await apiRequest({
    method: 'DELETE',
    endpoint: `/assignment/teacher/${assignmentId}`,
    getToken: getAuthToken,
  });
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
  await apiRequest({
    method: 'POST',
    endpoint: '/assignment/teacher/team',
    body: {
      title,
      description,
      deadline,
      pathRef,
      pathLanguage, // default language
      isExternal,
      classTeams,
      teamSize,
    },
    getToken: getAuthToken,
  });
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
  console.log('updateAssignment', {
    id,
    title,
    description,
    pathLanguage,
    isExternal,
    deadline,
    pathRef,
    classTeams,
    teamSize,
  });
  await apiRequest({
    method: 'PATCH',
    endpoint: `/assignment/teacher/team/${id}`,
    body: {
      title,
      description,
      deadline,
      pathRef,
      pathLanguage, // default language
      isExternal,
      classTeams,
      teamSize,
    },
    getToken: getAuthToken,
  });
}
