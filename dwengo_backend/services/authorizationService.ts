import { handlePrismaQuery } from "../errors/errorFunctions";
import { Role } from "@prisma/client";
import prisma from "../config/prisma";
import { NotFoundError } from "../errors/errors";

export const isAuthorized = async (
  userId: number,
  requiredRole: Role,
  classId?: number,
): Promise<boolean> => {
  const user = await handlePrismaQuery(() =>
    prisma.user.findUnique({
      where: { id: userId },
      select: { role: true, teacher: true, student: true },
    }),
  );

  if (!user) throw new NotFoundError("User not found.");

  // Admins are always authorized
  if (user.role === Role.ADMIN) return true;

  if (requiredRole === Role.TEACHER && user.role !== Role.TEACHER) return false;
  if (requiredRole === Role.STUDENT && user.role !== Role.STUDENT) return false;

  // Extra check for teachers: ensure they teach this class
  if (requiredRole === Role.TEACHER && classId) {
    const teachesClass = await handlePrismaQuery(() =>
      prisma.classTeacher.findFirst({
        where: { teacherId: userId, classId },
      }),
    );
    return teachesClass !== null;
  }

  // Extra check for students: ensure they are part of this class
  if (requiredRole === Role.STUDENT && classId) {
    const enrolled = await handlePrismaQuery(() =>
      prisma.classStudent.findFirst({
        where: { studentId: userId, classId },
      }),
    );
    return enrolled !== null;
  }

  return true;
};

export const canUpdateOrDelete = async (
  userId: number,
  assignmentId: number,
): Promise<boolean> => {
  if (!(await isAuthorized(userId, Role.TEACHER))) return false;

  // The teacher is authorized
  // Now there needs to be checked if the teacher has classes that have this assignment
  const allClassesTeacher: { classId: number }[] = await handlePrismaQuery(() =>
    prisma.classTeacher.findMany({
      where: { teacherId: userId },
      select: { classId: true },
    }),
  );

  if (allClassesTeacher.length === 0) return false;

  // Check if at least one of the classes of the teacher has the assignment
  const hasAssignment = await handlePrismaQuery(() =>
    prisma.classAssignment.findFirst({
      where: {
        assignmentId,
        classId: { in: allClassesTeacher.map((c) => c.classId) },
      },
    }),
  );

  return hasAssignment !== null;
};
