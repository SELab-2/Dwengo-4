import { Team } from "@prisma/client";

import prisma from "../config/prisma";
import { handlePrismaQuery } from "../errors/errorFunctions";
import { NotFoundError } from "../errors/errors";

export default class StudentTeamService {
  static async getStudentTeams(studentId: number): Promise<Team[]> {
    return await handlePrismaQuery(() =>
      prisma.team.findMany({
        where: {
          students: {
            some: { userId: studentId },
          },
        },
        include: {
          teamAssignment: {
            include: {
              assignment: true,
            },
          },
        },
      }),
    );
  }

  static async getTeam(studentId: number, assignmentId: number) {
    const team = await handlePrismaQuery(() =>
      prisma.team.findFirst({
        where: {
          students: {
            some: { userId: studentId },
          },
          teamAssignment: {
            assignmentId: assignmentId,
          },
        },
        include: {
          students: {
            select: {
              userId: true,
              user: {
                select: {
                  id: true,
                  email: true,
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
          teamAssignment: {
            include: {
              assignment: true,
            },
          },
        },
      }),
    );
    if (!team) {
      throw new NotFoundError(
        "Student is not part of a team for this assignment.",
      );
    }
    return team;
  }

  static async getTeamById(teamId: number) {
    const team = await handlePrismaQuery(() =>
      prisma.team.findUnique({
        where: { id: teamId },
        include: {
          students: {
            select: {
              userId: true,
              user: {
                select: {
                  id: true,
                  email: true,
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
        },
      }),
    );
    if (!team) {
      throw new NotFoundError("Team not found.");
    }
    return team;
  }
}
