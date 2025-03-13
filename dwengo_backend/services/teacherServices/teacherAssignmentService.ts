import { Assignment, PrismaClient, Role } from "@prisma/client";
import { isAuthorized } from "../authorizationService";

const prisma = new PrismaClient();

export default class TeacherAssignmentService {
  // Static method to create an assignment for a class
  static async createAssignmentForClass(
    teacherId: number,
    classId: number,
    learningPathId: string,
    deadline: Date
  ): Promise<Assignment> {
    if (!(await isAuthorized(teacherId, Role.TEACHER, classId))) {
      throw new Error("The teacher is unauthorized to perform this action");
    }

    return prisma.assignment.create({
      data: {
        learningPathId,
        deadline,
        classAssignments: {
          create: {
            classId, // This will automatically link to the created Assignment
          },
        },
      },
    });
  }

  // Static method to get assignments by class
  static async getAssignmentsByClass(
    classId: number,
    teacherId: number
  ): Promise<Assignment[]> {
    if (!(await isAuthorized(teacherId, Role.TEACHER, classId))) {
      throw new Error("The teacher is unauthorized to request the assignments");
    }
    return prisma.assignment.findMany({
      where: {
        classAssignments: {
          some: {
            classId: classId, // This ensures we are looking for assignments related to this class
          },
        },
      },
    });
  }

  // Static method to update an assignment
  static async updateAssignment(
    assignmentId: number,
    learningPathId: string,
    teacherId: number
  ): Promise<Assignment> {
    if (!(await isAuthorized(teacherId, Role.TEACHER))) {
      throw new Error("The teacher is unauthorized to update the assignment");
    }

    return prisma.assignment.update({
      where: { id: assignmentId },
      data: { learningPathId },
    });
  }

  // Static method to delete an assignment
  static async deleteAssignment(
    assignmentId: number,
    teacherId: number
  ): Promise<Assignment> {
    if (!(await isAuthorized(teacherId, Role.TEACHER))) {
      throw new Error("The teacher is unauthorized to delete the assignment");
    }

    return prisma.assignment.delete({
      where: { id: assignmentId },
    });
  }
}
