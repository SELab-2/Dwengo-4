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
}

interface formData {
  name: string;
  students: StudentItem[];
}

interface Team {
  id: string;
  members: StudentItem[];
}

interface ClassItem {
  id: string;
  name: string;
  students: StudentItem[];
  code: number;
}

export type { StudentItem, LearningPath, formData, Team, ClassItem };
