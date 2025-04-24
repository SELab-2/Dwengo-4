interface StudentItem {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface LearningPath {
  id: string;
  title: string;
  isExternal: boolean;
  description: string;
}

interface formData {
  name: string;
  students: StudentItem[];
}

interface Team {
  id: string;
  students: StudentItem[];
}

interface ClassItem {
  id: string;
  name: string;
  students: StudentItem[];
  code: number;
}

interface AssignmentPayload {
  id?: number;
  title: string;
  description: string;
  pathLanguage: string;
  isExternal: boolean;
  deadline: string;
  pathRef: string;
  classTeams?: Record<string, Team[]>;
  classAssignments?: ClassAssignment[];
  teamSize: number;
}

interface ClassAssignment {
  assignmentId: number;
  class: ClassItem;
}

interface TeamAssignment {
  teamId: number;
  assignmentId: number;
  team: {
    id: string;
    students: StudentItem[];
    classId: string;
  };
}

export type {
  StudentItem,
  LearningPath,
  formData,
  Team,
  ClassItem,
  AssignmentPayload,
  TeamAssignment,
};
