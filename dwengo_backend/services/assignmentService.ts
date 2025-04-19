import { handlePrismaQuery } from "../errors/errorFunctions";
import { Assignment } from "@prisma/client";
import prisma from "../config/prisma";
import { NotFoundError } from "../errors/errors";

export default class AssignmentService {
  static async getAssignmentById(
    assignmentId: number,
    includeClass: boolean,
    includeTeams: boolean
  ): Promise<Assignment> {
    const assignment = await handlePrismaQuery(() =>
      prisma.assignment.findUnique({
        where: { id: assignmentId },
        include: {
          classAssignments: {
            include: {
              class: includeClass,
            },
          },
          teamAssignments: {
            include: {
              team: {
                include: {
                  students: {
                    include: {
                      user: includeTeams,
                    },
                  },
                },
              },
            },
          },
        },
      })
    );
    if (!assignment) {
      throw new NotFoundError("Assignment not found.");
    }
    return assignment;
  }
}
