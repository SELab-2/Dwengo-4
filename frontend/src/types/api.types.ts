export interface AuthCredentials {
    firstName?: string;
    lastName?: string;
    email: string;
    password: string;
}

export interface AuthResponse {
    token: string;
}

export interface APIError extends Error {
    code?: number;
    info?: any;
}

export interface CreateClassPayload {
    name: string;
}

export interface UpdateClassPayload {
    name: string;
    classId: number;
}

export interface StudentItem {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
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


export interface ClassItem {
  id: string;
  name: string;
}

export interface AssignmentItem {
  id: string;
  title: string;
  description: string;
  deadline: string;
}
