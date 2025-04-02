import {  Student, User } from "@prisma/client";

import prisma from "../config/prisma";


export default class StudentService {
  static async findStudentById(
    userId: number
  ): Promise<Student & { user: User }> {
    return prisma.student.findUniqueOrThrow({
      where: { userId: userId },
      include: {
        user: true,
      },
    });
  }

  static async getStudentsByClass(classId: number): Promise<Student[]> {
    const classWithStudents = await prisma.class.findUnique({
      where: { id: classId },
      include: {
        classLinks: { include: { student: { include: { user: true } } } },
      },
    });

    if (!classWithStudents) {
      throw new Error(`Class with ID: ${classId} not found`);
    }

    return classWithStudents.classLinks.map((cs) => cs.student);
  }

  static async getStudentsByTeamAssignment(
    assignmentId: number,
    teamId: number
  ): Promise<Student[]> {
    return prisma.student.findMany({
      where: {
        Team: {
          some: {
            id: teamId,
            teamAssignment: {
              assignmentId: assignmentId,
            },
          },
        },
      },
      include: {
        user: true,
      },
    });
  }
}
