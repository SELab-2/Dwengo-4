import {  Submission } from "@prisma/client";
import { AccesDeniedError } from "../errors/errors";

import prisma from "../config/prisma";


export default class submissionService {
  static async createSubmission(
    studentId: number,
    evaluationId: string,
    assignmentId: number
  ): Promise<Submission> {
    // Controleren of de student in een team zit dat gekoppeld is aan de opdracht.
    // De originele filter probeerde ook te filteren op assignment.learningPath, maar dat veld bestaat niet.
    const team: {id: number} | null = await prisma.team.findFirst({
      where: {
        students: {
          some: {
            userId: studentId,
          },
        },
        teamAssignment: {
          assignment: {
            id: assignmentId,
          },
        },
      },
      select: {
        id: true,
      },
    });

    if (!team) {
      throw new AccesDeniedError("Student is not in a team for this assignment");
    }

    return prisma.submission.create({
      data: {
        evaluationId: evaluationId,
        teamId: team.id,
        assignmentId: assignmentId,
      },
    });
  }

  static async getSubmissionsForAssignment(
    assignmentId: number,
    studentId: number
  ): Promise<Submission[]> {
    return prisma.submission.findMany({
      where: {
        assignmentId: assignmentId,
        team: {
          students: {
            some: {
              userId: studentId,
            },
          },
          teamAssignment: {
            assignmentId: assignmentId,
          },
        },
      },
    });
  }

  static getSubmissionsForEvaluation(
    assignmentId: number,
    evaluationId: string,
    studentId: number
  ): Promise<Submission[]> {
    return prisma.submission.findMany({
      where: {
        assignmentId: assignmentId,
        evaluationId: evaluationId,
        team: {
          students: {
            some: {
              userId: studentId,
            },
          },
          teamAssignment: {
            assignmentId: assignmentId,
          },
        },
      },
    });
  }

  static teacherGetSubmissionsForStudent(
    studentId: number,
    teacherId: number,
    assignmentId?: number
  ): Promise<Submission[]> {
    return prisma.submission.findMany({
      where: {
        team: {
          students: {
            some: {
              userId: studentId,
            },
          },
        },
        assignment: {
          id: assignmentId,
          classAssignments: {
            some: {
              class: {
                ClassTeacher: {
                  some: {
                    teacherId: teacherId,
                  },
                },
              },
            },
          },
        },
      },
    });
  }

  static async teacherGetSubmissionsForTeam(
    teamId: number,
    teacherId: number,
    assignmentId?: number
  ) {
    return prisma.submission.findMany({
      where: {
        team: {
          id: teamId,
        },
        assignment: {
          id: assignmentId,
          classAssignments: {
            some: {
              class: {
                ClassTeacher: {
                  some: {
                    teacherId: teacherId,
                  },
                },
              },
            },
          },
        },
      },
    });
  }
}
