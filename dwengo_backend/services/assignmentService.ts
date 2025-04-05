import { handlePrismaQuery } from "../errors/errorFunctions";
import { Assignment } from "@prisma/client";
import prisma from "../config/prisma";
import { NotFoundError } from "../errors/errors";

export default class AssignmentService {
  static async getAssignmentById(assignmentId: number): Promise<Assignment> {
    const assignment: Assignment | null = await handlePrismaQuery(() =>
      prisma.assignment.findUnique({
        where: { id: assignmentId },
        // geen include meer, want there's no relation to learningPath
      }),
    );
    if (!assignment) {
      throw new NotFoundError(`Assignment with id ${assignmentId} not found.`);
    }
    // There is an assignment
    return assignment;
  }
}
