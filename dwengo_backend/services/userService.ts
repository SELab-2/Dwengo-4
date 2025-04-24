import { Role, Student, Teacher, User } from "@prisma/client";

import prisma from "../config/prisma";
import {
  handlePrismaQuery,
  handleQueryWithExistenceCheck,
} from "../errors/errorFunctions";
import { ConflictError } from "../errors/errors";

export default class UserService {
  static async emailInUse(email: string): Promise<void> {
    const user: User | null = await prisma.user.findUnique({
      where: { email },
    });
    if (user) {
      throw new ConflictError("Email already in use.");
    }
  }

  static async createUser(
    firstName: string,
    lastName: string,
    email: string,
    hashedPassword: string,
    role: Role
  ): Promise<User> {
    return await handlePrismaQuery(() =>
      prisma.user.create({
        data: {
          firstName,
          lastName,
          email,
          password: hashedPassword,
          role: role,
          // This immediately creates the teacher/student/admin records as well
          teacher: role === Role.TEACHER ? { create: {} } : undefined,
          student: role === Role.STUDENT ? { create: {} } : undefined,
          admin: role === Role.ADMIN ? { create: {} } : undefined,
        },
        include: {
          teacher: true,
          student: true,
          admin: true,
        },
      })
    );
  }

  static async findUserByEmail(email: string): Promise<User> {
    return await handleQueryWithExistenceCheck(
      () => prisma.user.findFirst({ where: { email } }),
      "Existing user not found."
    );
  }

  static async findTeacherUserById(
    userId: number
  ): Promise<Teacher & { user: User }> {
    return await handleQueryWithExistenceCheck(
      () =>
        prisma.teacher.findUnique({
          where: { userId },
          include: { user: true },
        }),
      "Teacher not found."
    );
  }

  static async findStudentUserById(
    userId: number
  ): Promise<Student & { user: User }> {
    return await handleQueryWithExistenceCheck(
      () =>
        prisma.student.findUnique({
          where: { userId },
          include: { user: true },
        }),
      "Student not found."
    );
  }
}
