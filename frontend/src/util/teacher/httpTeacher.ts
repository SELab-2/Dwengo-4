import { QueryClient } from "@tanstack/react-query";
import { getAuthToken } from "./authTeacher";

const BACKEND = "http://localhost:5000";

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

export async function loginTeacher({
  email,
  password,
}: AuthCredentials): Promise<AuthResponse> {
  const response = await fetch(`${BACKEND}/teacher/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const error: APIError = new Error(
      "Er is iets misgegaan tijdens het inloggen."
    );
    error.code = response.status;
    error.info = await response.json();
    throw error;
  }

  return await response.json();
}

export async function signupTeacher({
  firstName,
  lastName,
  email,
  password,
}: AuthCredentials): Promise<AuthResponse> {
  const response = await fetch(`${BACKEND}/teacher/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ firstName, lastName, email, password }),
  });

  if (!response.ok) {
    const error: APIError = new Error(
      "Er is iets misgegaan tijdens het registreren."
    );
    error.code = response.status;
    error.info = await response.json();
    throw error;
  }

  return await response.json();
}

interface ClassItem {
  id: string;
  name: string;
  code: string;
}

export async function fetchClasses(): Promise<ClassItem[]> {
  const response = await fetch(`${BACKEND}/teacher/classes`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getAuthToken()}`,
    },
  });

  if (!response.ok) {
    const error: APIError = new Error(
      "Er is iets misgegaan bij het ophalen van de klassen."
    );
    error.code = response.status;
    error.info = await response.json();
    throw error;
  }

  const returner = await response.json();
  const classrooms = returner["classrooms"];
  console.log("GETTING CLASSES", classrooms);

  return await classrooms;
}

interface CreateClassPayload {
  name: string;
}

export async function createClass({
  name,
}: CreateClassPayload): Promise<ClassItem> {
  const response = await fetch(`${BACKEND}/teacher/classes`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getAuthToken()}`,
    },
    body: JSON.stringify({ name }),
  });

  if (!response.ok) {
    const error: APIError = new Error(
      "Er is iets misgegaan bij het aanmaken van de klas."
    );
    error.code = response.status;
    error.info = await response.json();
    throw error;
  }

  return await response.json();
}

export async function fetchClass({
  classId,
}: {
  classId: number;
}): Promise<ClassItem> {
  const response = await fetch(`${BACKEND}/teacher/classes/${classId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getAuthToken()}`,
    },
  });

  if (!response.ok) {
    const error: APIError = new Error(
      "Er is iets misgegaan bij het ophalen van de klas."
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

export async function fetchStudentsByClass({
  classId,
}: {
  classId: number;
}): Promise<StudentItem[]> {
  const response = await fetch(
    `${BACKEND}/teacher/classes/${classId}/students`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getAuthToken()}`,
      },
    }
  );

  if (!response.ok) {
    const error: APIError = new Error(
      "Er is iets misgegaan bij het ophalen van de studenten."
    );
    error.code = response.status;
    error.info = await response.json();
    throw error;
  }

  let students = await response.json();
  students = students.students;
  return students;
}

interface LearningPath {
  id: string;
  title: string;
}

//Haal de locale leerpaden op van de leerkracht op
export async function fetchLearningPaths(): Promise<LearningPath[]> {
  const response = await fetch(`${BACKEND}/teacher/learningPaths`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getAuthToken()}`,
    },
  });

  if (!response.ok) {
    const error: APIError = new Error(
      "Er is iets misgegaan bij het ophalen van de leerpaden."
    );
    error.code = response.status;
    error.info = await response.json();
    throw error;
  }

  let learningPaths = await response.json();
  learningPaths = learningPaths;
  return learningPaths;
}

export async function createAssignment({
  classes,
  name,
  learningPathId,
  students,
  dueDate,
  description,
}: {
  classes: ClassItem[];
  name: string;
  learningPathId: string;
  students: StudentItem[];
  dueDate: string;
  description: string;
}): Promise<void> {
  const response = await fetch(`${BACKEND}/teacher/assignments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
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
      "Er is iets misgegaan bij het aanmaken van de opdracht."
    );
    error.code = response.status;
    error.info = await response.json();
    throw error;
  }
}

export interface Invite {
  inviteId: number;
  status: "PENDING" | "APPROVED" | "DENIED";
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
  classId: string
): Promise<Invite[]> {
  const response = await fetch(
    `${BACKEND}/teacher/classes/${classId}/invites`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getAuthToken()}`,
      },
    }
  );

  if (!response.ok) {
    const error: APIError = new Error(
      "Er is iets misgegaan bij het ophalen van de invites."
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
  const response = await fetch(
    `${BACKEND}/teacher/classes/${classId}/invites`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getAuthToken()}`,
      },
      body: JSON.stringify({ otherTeacherEmail }),
    }
  );

  if (!response.ok) {
    const error: APIError = new Error(
      "Er is iets misgegaan tijdens het uitnodigen."
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
    `${BACKEND}/teacher/classes/${classId}/join-requests`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getAuthToken()}`,
      },
    }
  );
  if (!response.ok) {
    const error = new Error(
      "Er is iets misgegaan bij het ophalen van de join requests."
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
    `${BACKEND}/teacher/classes/${classId}/join-requests/${requestId}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getAuthToken()}`,
      },
      body: JSON.stringify({ action: "approve" }),
    }
  );
  if (!response.ok) {
    const error: APIError = new Error(
      "Er is iets misgegaan bij het approven van de join request."
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
    `${BACKEND}/teacher/classes/${classId}/join-requests/${requestId}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getAuthToken()}`,
      },
      body: JSON.stringify({ action: "deny" }),
    }
  );
  if (!response.ok) {
    const error: APIError = new Error(
      "Er is iets misgegaan bij het denyen van de join request."
    );
    error.code = response.status;
    error.info = await response.json();
    throw error;
  }
  return await response.json();
}
