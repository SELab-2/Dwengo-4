import { Assignment, PrismaClient } from "@prisma/client";
import { handlePrismaQuery } from "../errors/errorFunctions";

const prisma = new PrismaClient();

export default class AssignmentService {
  static async getAssignmentById(
    assignmentId: number,
  ): Promise<Assignment | null> {
    return handlePrismaQuery(() =>
      prisma.assignment.findUnique({
        where: { id: assignmentId },
        // geen include meer, want there's no relation to learningPath
      }),
    );
  }
}
