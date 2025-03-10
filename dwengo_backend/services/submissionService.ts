import {PrismaClient, Submission} from "@prisma/client";
import {AccesDeniedError} from "../errors/errors";

const prisma = new PrismaClient();


export default class submissionService {

    static async createSubmission(studentId: number, evaluationId: string, assignmentId: number): Promise<Submission> {
        // TODO problemen met type
        // Controleren of student in team zit voor deze assignment
        const team = await prisma.team.findFirst({
            where: {
                students: {
                    some: {
                        userId: studentId,
                    }
                },
                teamAssignments: {
                    some: {
                        assignmentId: assignmentId,
                    }
                },
            },
            select: {
                id: true,
            }
        });
        if (!team) {
            throw new AccesDeniedError("Student is not in a team for this assignment");
        }
        // TODO hoe controleren of assignment bij evaluation hoort?

        return prisma.submission.create({
            data: {
                evaluationId: evaluationId,
                teamId: team.id,
                assignmentId: assignmentId,
            }
        })
    }

    static async getSubmissionsForAssignment(assignmentId: number, studentId: number): Promise<Submission[]> {
        // Team waar student in zit voor deze assignment
        const team = await prisma.team.findFirst({
            where: {
                students: {
                    some: {
                        userId: studentId,
                    }
                },
                teamAssignments: {
                    some: {
                        assignmentId: assignmentId,
                    }
                },
            },
            select: {
                id: true,
            }
        });
        if (!team) {
            throw new AccesDeniedError("Student is not in a team for this assignment");
        }

        return prisma.submission.findMany({
            where: {
                teamId: team.id,
                assignmentId: assignmentId,
            }
        });

    }
}