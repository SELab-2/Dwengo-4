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
  creator?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  createdAt: string;
  updatedAt: string;
  language: string;
  image?: string;
  nodes: LearningPathNode[];
  transitions: LearningPathTransition[];
}



interface LearningPathTransition {
  id: string;
  default: boolean;
  condition?: string;
  nodeId: string;
  nextNodeId?: string;
}

interface LearningPathNode {
  learningPathId: string;
  nodeId: string;
  localLearningObjectId?: string;
  dwengoHruid?: string;
  dwengoLanguage?: string;
  dwengoVersion?: number;
  isExternal: boolean;
  start_node: boolean;
  transitions: LearningPathTransition[];
}

interface LearningObject {
  id: string;
  hruid: string;
  version: number;
  language: string;
  description: string;
  title: string;
  contentType: string;
  keywords: string[];
  targetAges: number[];
  teacherExclusive: boolean;
  skosConcepts: string[];
  copyright: string;
  licence: string;
  difficulty: number;
  estimatedTime: number;
  available: boolean;
  contentLocation?: string;
  creatorId?: number; // for local objects
  createdAt: Date;
  updatedAt: Date;
  origin: string; // 'local' or 'dwengo'
  raw?: string; // for dwengo objects
}

type LearningPathNodeWithObject = LearningPathNode & {
  learningObject: LearningObject | null;
};

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

interface Transition {
  nodeId: string;
  nextNodeId: string | null;
  default: boolean;
  condition?: string | null;
}


export type {
  StudentItem,
  LearningPath,
  LearningPathNode,
  LearningObject,
  LearningPathNodeWithObject,
  formData,
  Team,
  ClassItem,
  AssignmentPayload,
  TeamAssignment,
  Transition
};
