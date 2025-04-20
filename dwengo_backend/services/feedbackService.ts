import { handlePrismaQuery } from "../errors/errorFunctions";
import {
  AccessDeniedError,
  BadRequestError,
  ForbiddenActionError,
  NotFoundError,
} from "../errors/errors";
import { Assignment, Feedback, Teacher } from "@prisma/client";

import prisma from "../config/prisma";

const teacherAccessDeniedMessage =
  "Teacher should teach this class to perform this action.";
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
    this.validateSubmissionId(submissionId);

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
      throw new ForbiddenActionError(
        "Deadline not over yet. Feedback can only be given after the deadline.",
      );
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
    this.validateSubmissionId(submissionId);

    await this.hasSubmissionRights(teacherId, submissionId);

    return this.checkExistenceFeedback(submissionId);
  }

  static async updateFeedbackForSubmission(
    submissionId: number,
    description: string,
    teacherId: number,
  ): Promise<Feedback> {
    this.validateSubmissionId(submissionId);

    await this.hasSubmissionRights(teacherId, submissionId);

    // Check if feedback exists
    await this.checkExistenceFeedback(submissionId);

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
    this.validateSubmissionId(submissionId);

    await this.hasSubmissionRights(teacherId, submissionId);

    await this.checkExistenceFeedback(submissionId);

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
      throw new AccessDeniedError(teacherAccessDeniedMessage);
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
      throw new AccessDeniedError(teacherAccessDeniedMessage);
    }

    return true;
  }

  static validateSubmissionId(submissionId: number): void {
    if (isNaN(submissionId)) {
      throw new BadRequestError("Submission ID is not a valid number.");
    }
  }

  static async checkExistenceFeedback(submissionId: number): Promise<Feedback> {
    // Check if feedback exists
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
}
