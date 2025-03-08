import {Feedback, PrismaClient} from '@prisma/client';

const prisma = new PrismaClient();

export default class FeedbackService {
    static async getAllFeedbackForEvaluation(evaluationId: string): Promise<Feedback[]> {
        return prisma.feedback.findMany({
            where: {
                submission: {
                    evaluationId: evaluationId,
                },
            },
            include: {
                submission: true,
            },
        });
    }

    static async createFeedback(submissionId: number, teacherId: number, description: string): Promise<Feedback> {
        return prisma.feedback.create({
            data: {
                submissionId: submissionId,
                teacherId: teacherId,
                description: description,
            },
        });
    }

    static getFeedbackForSubmission(submissionId: number): Promise<Feedback> {
        return prisma.feedback.findUnique({
            where: {
                submissionId: submissionId,
            }
        });
    }

    static updateFeedbackForSubmission(submissionId: number, description: string): Promise<Feedback> {
        return prisma.feedback.update({
            where: {
                submissionId: submissionId,
            },
            data: {
                description: description,
            },
        });
    }

    static deleteFeedbackForSubmission(submissionId: number): Promise<Feedback> {
        return prisma.feedback.delete({
            where: {
                submissionId: submissionId,
            },
        });

    }
}