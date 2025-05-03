import { handleQueryWithExistenceCheck } from "../errors/errorFunctions";
import { Assignment } from "@prisma/client";
import prisma from "../config/prisma";

export default class AssignmentService {
  static async getAssignmentById(
    assignmentId: number,
    includeClass: boolean,
    includeTeams: boolean,
  ): Promise<Assignment> {
    return await handleQueryWithExistenceCheck(
      () =>
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
        }),
      `Assignment not found.`,
    );
  }
}
