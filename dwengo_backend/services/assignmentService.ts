import { handlePrismaQuery } from "../errors/errorFunctions";
import { Assignment } from "@prisma/client";
import prisma from "../config/prisma";

export default class AssignmentService {
  static async getAssignmentById(
    assignmentId: number
  ): Promise<Assignment | null> {
    return await handlePrismaQuery(() =>
      prisma.assignment.findUnique({
        where: { id: assignmentId },
        // geen include meer, want there's no relation to learningPath
      })
    );
  }
}
