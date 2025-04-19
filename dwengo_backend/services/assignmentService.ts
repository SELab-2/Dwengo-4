import { handlePrismaQuery } from "../errors/errorFunctions";
import { Assignment } from "@prisma/client";
import prisma from "../config/prisma";
import { NotFoundError } from "../errors/errors";

export default class AssignmentService {
  static async getAssignmentById(assignmentId: number): Promise<Assignment> {
    const assignment: Assignment | null = await handlePrismaQuery(() =>
      prisma.assignment.findUnique({
        where: { id: assignmentId },
      }),
    );
    if (!assignment) {
      throw new NotFoundError(`Assignment not found.`);
    }
    // There is an assignment
    return assignment;
  }
}
