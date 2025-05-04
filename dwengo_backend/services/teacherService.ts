import { Teacher, User } from "@prisma/client";

import prisma from "../config/prisma";
import {
  handlePrismaQuery,
  handleQueryWithExistenceCheck,
} from "../errors/errorFunctions";

export default class TeacherService {
  static async findTeacherById(
    userId: number,
  ): Promise<Teacher & { user: User }> {
    return await handleQueryWithExistenceCheck(
      () =>
        prisma.teacher.findUnique({
          where: { userId: userId },
          include: {
            user: true,
          },
        }),
      "Teacher not found",
    );
  }

  static async getAllTeachers(): Promise<Teacher[]> {
    return await handlePrismaQuery(() =>
      prisma.teacher.findMany({
        include: {
          user: true, // Inclusief gebruikersinformatie
        },
      }),
    );
  }

  static async getTeachersByClass(classId: number): Promise<Teacher[]> {
    return await handlePrismaQuery(() =>
      prisma.teacher.findMany({
        where: {
          teaches: {
            some: { classId }, // Find teachers who are linked to this class
          },
        },
        include: {
          user: true, // Includes full user data in each teacher object
        },
      }),
    );
  }
}
