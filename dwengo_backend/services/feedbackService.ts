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
}