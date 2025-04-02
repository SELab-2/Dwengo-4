import {  Teacher, User } from "@prisma/client";

import prisma from "../config/prisma";


export default class TeacherService {
  static async findTeacherById(
    userId: number
  ): Promise<Teacher & { user: User }> {
    return prisma.teacher.findUniqueOrThrow({
      where: { userId: userId },
      include: {
        user: true,
      },
    });
  }

  static async getAllTeachers(): Promise<Teacher[]> {
    return prisma.teacher.findMany({
      include: {
        user: true, // Inclusief gebruikersinformatie
      },
    });
  }

  static async getTeachersByClass(classId: number): Promise<Teacher[]> {
    return prisma.teacher.findMany({
      where: {
        teaches: {
          some: { classId }, // Find teachers who are linked to this class
        },
      },
      include: {
        user: true, // Includes full user data in each teacher object
      },
    });
  }
}
