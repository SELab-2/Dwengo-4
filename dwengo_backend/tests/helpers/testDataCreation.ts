import prisma from "./prisma";
import {
  Assignment,
  Class,
  EvaluationType,
  Invite,
  JoinRequest,
  JoinRequestStatus,
  LearningPath,
  Student,
  Submission,
  Teacher,
  Team,
  TeamAssignment,
  User,
  LearningObject,
} from "@prisma/client";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

// (Nieuwe interface voor de createLearningObject helper)
export interface LocalLearningObjectData {
  title: string;
  description: string;
  contentType: string;
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
}

// === Helper functions to create test data ===

export async function createTeacher(
  firstName: string,
  lastName: string,
  email: string,
): Promise<User & { teacher: Teacher; token: string }> {
  const user = await prisma.user.create({
    data: {
      firstName,
      lastName,
      email,
      password: "testpassword",
      role: "TEACHER",
      teacher: {
        create: {},
      },
    },
    include: {
      teacher: true,
    },
  });
  const token: string = jwt.sign(
    { id: user.id },
    process.env.JWT_SECRET as string,
    {
      expiresIn: "1h",
    },
  );
  return { ...user, teacher: user.teacher!, token };
}

export async function createStudent(
  firstName: string,
  lastName: string,
  email: string,
): Promise<User & { student: Student; token: string }> {
  const user = await prisma.user.create({
    data: {
      firstName,
      lastName,
      email,
      password: "testpassword",
      role: "STUDENT",
      student: {
        create: {},
      },
    },
    include: {
      student: true,
    },
  });
  const token: string = jwt.sign(
    { id: user.id },
    process.env.JWT_SECRET as string,
    {
      expiresIn: "1h",
    },
  );
  return { ...user, student: user.student!, token };
}

export async function createClass(name: string, code: string): Promise<Class> {
  return prisma.class.create({
    data: {
      name,
      code,
    },
  });
}

export async function createInvite(
  classTeacherId: number,
  otherTeacherId: number,
  classId: number,
): Promise<Invite> {
  return prisma.invite.create({
    data: {
      otherTeacherId,
      classTeacherId,
      classId,
      status: JoinRequestStatus.PENDING,
    },
  });
}

export async function addTeacherToClass(
  teacherId: number,
  classId: number,
): Promise<void> {
  await prisma.classTeacher.create({
    data: {
      teacherId,
      classId,
    },
  });
}

export async function createLearningPath(
  title: string,
  description: string,
  creatorId: number,
): Promise<LearningPath> {
  return prisma.learningPath.create({
    data: {
      // Random string generator die letters en cijfers geeft
      hruid: Math.random().toString(36).substring(2, 14),
      title,
      description,
      language: "nl",
      creator: {
        connect: {
          userId: creatorId,
        },
      },
    },
  });
}

export async function addStudentToClass(
  studentId: number,
  classId: number,
): Promise<void> {
  await prisma.classStudent.create({
    data: {
      studentId,
      classId,
    },
  });
}

export async function createJoinRequest(
  studentId: number,
  classId: number,
): Promise<JoinRequest> {
  return prisma.joinRequest.create({
    data: {
      studentId,
      classId,
      status: JoinRequestStatus.PENDING,
    },
  });
}

export async function createAssignment(
  classId: number,
  learningPathId: string,
  title: string,
  description: string,
  deadline: Date,
): Promise<Assignment> {
  return prisma.assignment.create({
    data: {
      pathRef: learningPathId,
      title,
      description,
      deadline,
      classAssignments: {
        create: {
          classId,
        },
      },
      teamSize: 2,
    },
  });
}

export async function createSubmission(
  evaluationId: string,
  teamId: number,
  assignmentId: number,
): Promise<Submission> {
  return prisma.submission.create({
    data: {
      evaluationId,
      teamId,
      assignmentId,
    },
  });
}

export async function giveFeedbackToSubmission(
  submissionId: number,
  teacherId: number,
  description: string,
) {
  return prisma.feedback.create({
    data: {
      submissionId,
      teacherId,
      descriptio,
    },
  });
}

export async function giveAssignmentToTeam(
  assignmentId: number,
  teamId: number,
): Promise<TeamAssignment> {
  return prisma.teamAssignment.create({
    data: {
      teamId,
      assignmentId,
    },
  });
}

export async function updateAssignmentForTeam(
  assignmentId: number,
  teamId: number,
): Promise<TeamAssignment> {
  return prisma.teamAssignment.update({
    where: {
      teamI,
    },
    data: {
      assignmentId,
    },
  });
}

export async function createEvaluation(
  learningObjectId: string,
  type: EvaluationType,
) {
  return prisma.evaluation.create({
    data: {
      nrOfQuestions: 10,
      evaluationType: type,
      learningObject: {
        connect: { id: learningObjectId },
      },
    },
  });
}

export async function createTeamWithStudents(
  teamName: string,
  classId: number,
  students: Student[],
): Promise<Team> {
  return prisma.team.create({
    data: {
      teamname: teamName,
      classId,
      students: {
        connect: students.map((s) => ({ userId: s.userId }),
      },
    },
  });
}

export function stringToDate(body: any, length: number): void {
  for (let i = 0; i < length; i += 1) {
    body[i].createdAt = new Date(body[i].createdAt);
    body[i].updatedAt = new Date(body[i].updatedAt);
    body[i].deadline = new Date(body[i].deadline);
  }
}

// === DE TOEGEVOEGDE createLearningObject helper ===

export async function createLearningObject(
  teacherId: number,
  data: LocalLearningObjectData
): Promise<LearningObject> {
  return prisma.learningObject.create({
    data: {
      hruid: `${data.title.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}`,
      language: "nl",
      title: data.title,
      description: data.description,
      contentType: data.contentType,
      keywords: data.keywords ?? [],
      targetAges: data.targetAges ?? [],
      teacherExclusive: data.teacherExclusive ?? false,
      skosConcepts: data.skosConcepts ?? [],
      copyright: data.copyright ?? "",
      licence: data.licence ?? "CC BY Dwengo",
      difficulty: data.difficulty ?? 1,
      estimatedTime: data.estimatedTime ?? 0,
      available: data.available ?? true,
      contentLocation: data.contentLocation ?? "",
      creatorId: teacherId
    }
  });
}
