import { Role, Student, Teacher, User } from "@prisma/client";

import prisma from "../config/prisma";
import { handlePrismaQuery } from "../errors/errorFunctions";

export default class UserService {
  static async findUser(email: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { email } });
  }

  static async createUser(
    firstName: string,
    lastName: string,
    email: string,
    hashedPassword: string,
    role: Role,
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
      }),
    );
  }

  static async findUserByEmail(email: string): Promise<User> {
    return await handlePrismaQuery(() =>
      prisma.user.findUniqueOrThrow({ where: { email } }),
    );
  }

  static async findTeacherUserById(
    userId: number,
  ): Promise<(Teacher & { user: User }) | null> {
    return await handlePrismaQuery(() =>
      prisma.teacher.findUnique({
        where: { userId },
        include: { user: true },
      }),
    );
  }

  static async findStudentUserById(
    userId: number,
  ): Promise<(Student & { user: User }) | null> {
    return await handlePrismaQuery(() =>
      prisma.student.findUnique({
        where: { userId },
        include: { user: true },
      }),
    );
  }
}
