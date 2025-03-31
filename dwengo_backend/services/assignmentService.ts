import { Assignment, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default class AssignmentService {
  static async getAssignmentById(assignmentId: number, includeClass: boolean, includeTeams: boolean): Promise<Assignment | null> {
    return prisma.assignment.findUnique({
      where: { id: assignmentId },
      include: {
        classAssignments: {
          include: {
            class: includeClass
          }
        },
        teamAssignments: {
          include: {
            team: {
              include: {
                students: {
                  include: {
                    user: includeTeams
                  }
                }
              }
            }
          }
        }
      },

    });
  }
}

