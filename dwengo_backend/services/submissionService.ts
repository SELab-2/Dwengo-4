import {Prisma, PrismaClient, Submission} from "@prisma/client";
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
        // TODO controleren of deadline al voor bij is? Of laten we dit gewoon toe zoals Dodona

        return prisma.submission.create({
            data: {
                evaluationId: evaluationId,
                teamId: team.id,
                assignmentId: assignmentId,
            }
        })
    }

    static async getSubmissionsForAssignment(assignmentId: number, studentId: number): Promise<Submission[]> {
        return prisma.submission.findMany({
            where: {
                team: {
                    students: {
                        some: {
                            userId: studentId,
                        }
                    },
                    teamAssignments: {
                        some: {
                            assignmentId: assignmentId,
                        }
                    }
                },
                assignmentId: assignmentId,
            }
        });

    }

    static getSubmissionsForEvaluation(assignmentId: number, evaluationId: string, studentId: number): Promise<Submission[]> {
        return prisma.submission.findMany({
            where: {
                assignmentId: assignmentId,
                evaluationId: evaluationId,
                team: {
                    students: {
                        some: {
                            userId: studentId,
                        }
                    },
                    teamAssignments: {
                        some: {
                            assignmentId: assignmentId,
                        }
                    }
                }
            }
        });
    }

    static teacherGetSubmissionsForStudent(studentId: number, teacherId: number, assignmentId?: number): Promise<Submission[]> {
        return prisma.submission.findMany({
            where: {
                team: {
                    students: {
                        some: {
                            userId: studentId,
                        }
                    }
                },
                assignment: {
                    assignmentId: assignmentId ?? Prisma.skip,
                    classAssignments: {
                        some: {
                            class: {
                                ClassTeacher: {
                                    some: {
                                        teacherId: teacherId,
                                    }
                                }
                            }
                        }
                    },
                }
            }
        });
    }

    static async teacherGetSubmissionsForTeam(teamId: number, teacherId: number, assignmentId?: number) {
        return prisma.submission.findMany({
            where: {
                team: {
                    id: teamId,
                },
                assignment: {
                    assignmentId: assignmentId ?? Prisma.skip,
                    classAssignments: {
                        some: {
                            class: {
                                ClassTeacher: {
                                    some: {
                                        teacherId: teacherId,
                                    }
                                }
                            }
                        }
                    },
                }
            }
        });
    }
}