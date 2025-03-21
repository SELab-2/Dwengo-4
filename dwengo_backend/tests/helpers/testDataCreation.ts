import prisma from "./prisma";
import {
  Assignment,
  Class, EvaluationType,
  Invite,
  JoinRequest,
  JoinRequestStatus,
  LearningPath,
  Student,
  Teacher,
  User,
} from "@prisma/client";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

// helper functions to create test data in the database for tests to avoid code duplication in the tests themselves

export async function createTeacher(
  firstName: string,
  lastName: string,
  email: string
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
    }
  );
  return { ...user, teacher: user.teacher!, token };
}

export async function createStudent(
  firstName: string,
  lastName: string,
  email: string
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
    }
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
  classId: number
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
  classId: number
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
  creatorId: number
): Promise<LearningPath> {
  return prisma.learningPath.create({
    data: {
      // Random string generator that generates a string of numbers and lowercase letters
      hruid: Math.random()
          .toString(36)
          .substring(2, 2 + 12),
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
  classId: number
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
  classId: number
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
  deadline: Date
): Promise<Assignment> {
  return prisma.assignment.create({
    data: {
      pathRef: learningPathId,
      deadline,
      classAssignments: {
        create: {
          classId, // This will automatically link to the created Assignment
        },
      },
    },
  });
}

export async function createEvaluation(learningObjectId: string, type: EvaluationType) {
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

export function stringToDate(body: any, length: number): void {
  for (let i: number = 0; i < length; i += 1) {
    body[i].createdAt = new Date(body[i].createdAt);
    body[i].updatedAt = new Date(body[i].updatedAt);
    body[i].deadline = new Date(body[i].deadline);
  }
}
