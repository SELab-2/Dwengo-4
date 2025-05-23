import {
  handlePrismaQuery,
  handleQueryWithExistenceCheck,
} from "../errors/errorFunctions";
import { Role } from "@prisma/client";
import prisma from "../config/prisma";
import { AccessDeniedError, UnauthorizedError } from "../errors/errors";

export const isAuthorized = async (
  userId: number,
  requiredRole: Role,
  classId?: number
): Promise<void> => {
  const user = await handleQueryWithExistenceCheck(
    () =>
      prisma.user.findUnique({
        where: { id: userId },
        select: { role: true, teacher: true, student: true },
      }),
    `User with id: ${userId} not found.`
  );

  // Admins are authorized for everything
  if (user.role === Role.ADMIN) return;

  if (
    (requiredRole === Role.TEACHER && user.role !== Role.TEACHER) ||
    (requiredRole === Role.STUDENT && user.role !== Role.STUDENT)
  ) {
    throw new UnauthorizedError(
      "User is not authorized to perform this action."
    );
  }

  if (classId) await classCheck(userId, classId, requiredRole);
};

export const classCheck = async (
  userId: number,
  classId: number,
  requiredRole: Role
): Promise<void> => {
  // Extra check for teachers: ensure they teach this class
  if (requiredRole === Role.TEACHER && classId) {
    const teachesClass = await prisma.classTeacher.findFirst({
      where: { teacherId: userId, classId },
    });
    if (!teachesClass) {
      throw new AccessDeniedError("Teacher does not teach this class.");
    }
  }

  // Extra check for students: ensure they are part of this class
  if (requiredRole === Role.STUDENT && classId) {
    const enrolled = await prisma.classStudent.findFirst({
      where: { studentId: userId, classId },
    });
    if (!enrolled) {
      throw new AccessDeniedError("Student is not enrolled in this class.");
    }
  }
};

export const canUpdateOrDelete = async (
  userId: number,
  assignmentId: number
): Promise<void> => {
  // Check if the user is authorized as a teacher
  await isAuthorized(userId, Role.TEACHER);

  // The teacher is authorized
  // Now there needs to be checked if the teacher has classes that have this assignment
  const allClassesTeacher: { classId: number }[] = await handlePrismaQuery(() =>
    prisma.classTeacher.findMany({
      where: { teacherId: userId },
      select: { classId: true },
    })
  );

  if (allClassesTeacher.length === 0)
    throw new AccessDeniedError("This teacher teaches no classes.");

  // Check if at least one of the classes of the teacher has the assignment
  await handleQueryWithExistenceCheck(
    () =>
      prisma.classAssignment.findFirst({
        where: {
          assignmentId: assignmentId,
          classId: { in: allClassesTeacher.map((c) => c.classId) },
        },
      }),
    "No classes of this teacher have this assignment."
  );
};
