import { Team } from "@prisma/client";

import prisma from "../config/prisma";
import {
  handlePrismaQuery,
  handleQueryWithExistenceCheck,
} from "../errors/errorFunctions";

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
    return await handleQueryWithExistenceCheck(
      () =>
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
      "Student is not part of a team for this assignment.",
    );
  }

  static async getTeamById(teamId: number) {
    return await handleQueryWithExistenceCheck(
      () =>
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
      "Team not found.",
    );
  }
}
