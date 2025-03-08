import {Feedback, PrismaClient} from '@prisma/client';
import {AuthenticatedRequest} from "../middleware/teacherAuthMiddleware";
import {Response} from "express";


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

    static hasEvaluationRights(evaluationId: string, req: AuthenticatedRequest, res: Response) {
        const teacherId: number | undefined = req.user?.id;
        //TODO check if teacher has rights on evaluation
        // Hoe moet dit in de databank?
        return true;
    }

    static async hasSubmissionRights(submissionId: number, req: AuthenticatedRequest, res: Response) {
        //TODO problemen met type
        const evaluation = await prisma.evaluation.findFirst({
            where: {
                submissions: {
                    some: {
                        submissionId: submissionId,
                    },
                },
            },
        });
        return this.hasEvaluationRights(evaluation.id, req, res);
    }
}