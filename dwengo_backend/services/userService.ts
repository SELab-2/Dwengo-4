import { Role, Student, Teacher, User } from "@prisma/client";

import prisma from "../config/prisma";
import { handlePrismaQuery } from "../errors/errorFunctions";
import { ConflictError, NotFoundError } from "../errors/errors";

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
    const user: User | null = await handlePrismaQuery(() =>
      prisma.user.findFirst({ where: { email } }),
    );
    if (!user) {
      throw new NotFoundError("Existing user not found.");
    }
    return user;
  }

  static async findTeacherUserById(
    userId: number,
  ): Promise<Teacher & { user: User }> {
    const teacher: (Teacher & { user: User }) | null = await handlePrismaQuery(
      () =>
        prisma.teacher.findUnique({
          where: { userId },
          include: { user: true },
        }),
    );
    if (!teacher) {
      throw new NotFoundError("Teacher not found.");
    }
    return teacher;
  }

  static async findStudentUserById(
    userId: number,
  ): Promise<Student & { user: User }> {
    const student: (Student & { user: User }) | null = await handlePrismaQuery(
      () =>
        prisma.student.findUnique({
          where: { userId },
          include: { user: true },
        }),
    );
    if (!student) {
      throw new NotFoundError("Student not found.");
    }
    return student;
  }
}
