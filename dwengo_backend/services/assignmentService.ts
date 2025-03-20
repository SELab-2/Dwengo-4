import { Assignment, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default class AssignmentService {
  static async getAssignmentById(assignmentId: number): Promise<Assignment | null> {
    return prisma.assignment.findUnique({
      where: { id: assignmentId },
      // geen include meer, want there's no relation to learningPath
    });
  }
}

