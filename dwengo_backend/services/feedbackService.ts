import {Feedback, PrismaClient} from '@prisma/client';


const prisma = new PrismaClient();

export default class FeedbackService {
    static async getAllFeedbackForEvaluation(assignmentId: number, evaluationId: string, teacherId: number): Promise<Feedback[]> {
        if (!await this.hasEvaluationRights(assignmentId, teacherId, evaluationId)) {
            throw new Error("The teacher is unauthorized to perform this action");
        }

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
        if (!await this.hasSubmissionRights(teacherId, submissionId)) {
            throw new Error("The teacher is unauthorized to perform this action");
        }

        // aantal evaluaties met deadline in de toekomst
        const deadline: number = await prisma.evaluation.count({
            where: {
                submissions: {
                    some: {
                        submissionId: submissionId,
                    },
                },
                deadline: {
                    gte: new Date()
                }
            }
        });

        // Als deadline in de toekomst ligt: error
        if (deadline > 0) {
            throw new Error("Deadline in toekomst");
        }

        return prisma.feedback.create({
            data: {
                submissionId: submissionId,
                teacherId: teacherId,
                description: description,
            },
        });
    }

    static async getFeedbackForSubmission(submissionId: number, teacherId: number): Promise<Feedback> {
        if (!await this.hasSubmissionRights(teacherId, submissionId)) {
            throw new Error("The teacher is unauthorized to perform this action");
        }

        return prisma.feedback.findUnique({
            where: {
                submissionId: submissionId,
            }
        });
    }

    static async updateFeedbackForSubmission(submissionId: number, description: string, teacherId: number): Promise<Feedback> {
        if (!await this.hasSubmissionRights(teacherId, submissionId)) {
            throw new Error("The teacher is unauthorized to perform this action");
        }

        return prisma.feedback.update({
            where: {
                submissionId: submissionId,
            },
            data: {
                description: description,
            },
        });
    }

    static async deleteFeedbackForSubmission(submissionId: number, teacherId: number): Promise<Feedback> {
        if (!await this.hasSubmissionRights(teacherId, submissionId)) {
            throw new Error("The teacher is unauthorized to perform this action");
        }

        return prisma.feedback.delete({
            where: {
                submissionId: submissionId,
            },
        });

    }

    static hasEvaluationRights(assignmentId: number, teacherId: number, evaluationId: string) {
        //TODO check if teacher has rights on evaluation
        // Hoe moet dit in de databank?


        return true;
    }

    static async hasSubmissionRights(teacherId: number, submissionId: number) {
        // Tel aantal leerkrachten die rechten hebben op de submission
        const teacherWithRights: number = await prisma.teacher.count({
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
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        );

        // Return true als teacher rechten heeft
        return teacherWithRights > 0;
    }
}