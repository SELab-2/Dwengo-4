import { Feedback, PrismaClient } from '@prisma/client';


const prisma = new PrismaClient();

export default class FeedbackService {
    static async getAllFeedbackForEvaluation(assignmentId: number, evaluationId: string, teacherId: number): Promise<Feedback[]> {
        if (!await this.hasAssignmentRights(assignmentId, teacherId)) {
            throw new Error("The teacher is unauthorized to perform this action");
        }

        return prisma.feedback.findMany({
            where: {
                submission: {
                    evaluationId: evaluationId,
                    assignmentId: assignmentId
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
        const deadline = await prisma.evaluation.findFirst({
            where: {
                submissions: {
                    some: {
                        submissionId: submissionId,
                    },
                }
            }
        });

        // Als deadline in de toekomst ligt: error
        if (deadline !== null) {
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

    static async getFeedbackForSubmission(submissionId: number, teacherId: number): Promise<Feedback | null> {
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

    static async hasAssignmentRights(assignmentId: number, teacherId: number) {
        // Tel aantal leerkrachten die rechten hebben op de evaluatie
        const teacherWithRights = await prisma.teacher.findFirst({
            where: {
                userId: teacherId,
                teaches: {
                    some: {
                        class: {
                            assignments: {
                                some: {
                                    assignment: {
                                        id: assignmentId,
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        );

        return teacherWithRights !== null;
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