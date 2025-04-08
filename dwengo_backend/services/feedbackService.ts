import { handlePrismaQuery } from "../errors/errorFunctions";
import {
  AccesDeniedError,
  ForbiddenActionError,
  NotFoundError,
} from "../errors/errors";
import { Assignment, Feedback, Teacher } from "@prisma/client";

import prisma from "../config/prisma";

const teacherAccessDeniedMessage =
  "The teacher is unauthorized to do this action.";
export default class FeedbackService {
  static async getAllFeedbackForEvaluation(
    assignmentId: number,
    evaluationId: string,
    teacherId: number,
  ): Promise<Feedback[]> {
    await this.hasAssignmentRights(assignmentId, teacherId);

    return await handlePrismaQuery(() =>
      prisma.feedback.findMany({
        where: {
          submission: {
            evaluationId: evaluationId,
            assignmentId: assignmentId,
          },
        },
        include: {
          submission: true,
        },
      }),
    );
  }

  static async createFeedback(
    submissionId: number,
    teacherId: number,
    description: string,
  ): Promise<Feedback> {
    await this.hasSubmissionRights(teacherId, submissionId);

    // aantal evaluaties met deadline in de toekomst
    const deadline: Assignment | null = await handlePrismaQuery(() =>
      prisma.assignment.findFirst({
        where: {
          submissions: {
            some: {
              submissionId: submissionId,
            },
          },
          deadline: {
            // gte == Greater than equal
            gte: new Date(),
          },
        },
      }),
    );

    // Als deadline in de toekomst ligt: error
    if (deadline !== null) {
      throw new ForbiddenActionError("Deadline in toekomst");
    }

    return await handlePrismaQuery(() =>
      prisma.feedback.create({
        data: {
          submissionId: submissionId,
          teacherId: teacherId,
          description: description,
        },
      }),
    );
  }

  static async getFeedbackForSubmission(
    submissionId: number,
    teacherId: number,
  ): Promise<Feedback> {
    await this.hasSubmissionRights(teacherId, submissionId);

    const feedback: Feedback | null = await handlePrismaQuery(() =>
      prisma.feedback.findUnique({
        where: {
          submissionId: submissionId,
        },
      }),
    );
    if (feedback === null) {
      throw new NotFoundError("Feedback not found for this submission.");
    }
    return feedback;
  }

  static async updateFeedbackForSubmission(
    submissionId: number,
    description: string,
    teacherId: number,
  ): Promise<Feedback> {
    await this.hasSubmissionRights(teacherId, submissionId);

    return await handlePrismaQuery(() =>
      prisma.feedback.update({
        where: {
          submissionId: submissionId,
        },
        data: {
          description: description,
        },
      }),
    );
  }

  static async deleteFeedbackForSubmission(
    submissionId: number,
    teacherId: number,
  ): Promise<Feedback> {
    await this.hasSubmissionRights(teacherId, submissionId);

    return await handlePrismaQuery(() =>
      prisma.feedback.delete({
        where: {
          submissionId: submissionId,
        },
      }),
    );
  }

  static async hasAssignmentRights(
    assignmentId: number,
    teacherId: number,
  ): Promise<boolean> {
    // Tel aantal leerkrachten die rechten hebben op de evaluatie
    const teacherWithRights: Teacher | null = await handlePrismaQuery(() =>
      prisma.teacher.findFirst({
        where: {
          userId: teacherId,
          teaches: {
            some: {
              class: {
                assignments: {
                  some: {
                    assignment: {
                      id: assignmentId,
                    },
                  },
                },
              },
            },
          },
        },
      }),
    );

    if (teacherWithRights === null) {
      // The teacher has no rights
      throw new AccesDeniedError(teacherAccessDeniedMessage);
    }

    return true;
  }

  static async hasSubmissionRights(
    teacherId: number,
    submissionId: number,
  ): Promise<boolean> {
    // Ga na of de leerkracht rechten heeft op de submission
    const teacherWithRights: Teacher | null = await handlePrismaQuery(() =>
      prisma.teacher.findFirst({
        where: {
          userId: teacherId,
          teaches: {
            some: {
              class: {
                assignments: {
                  some: {
                    assignment: {
                      submissions: {
                        some: {
                          submissionId: submissionId,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      }),
    );

    if (teacherWithRights === null) {
      // The teacher has no rights
      throw new AccesDeniedError(teacherAccessDeniedMessage);
    }

    return true;
  }
}
