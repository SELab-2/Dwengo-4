import {PrismaClient, Team} from "@prisma/client";

const prisma = new PrismaClient();

export default class StudentTeamService {
    static async getStudentTeams(studentId: number): Promise<Team[]> {
        return prisma.team.findMany({
            where: {
                students: {
                    some: {userId: studentId}
                }
            },
            include: {
                teamAssignment: {
                    include: {
                        assignment: true,
                    },
                },
            },
        });
    };

    static async getTeam(studentId: number, assignmentId: number) {
        return prisma.team.findFirst({
            where: {
                students: {
                    some: {userId: studentId}
                },
                teamAssignment: {
                    assignmentId: assignmentId,
                }
            },
            include: {
                students: {
                    select: {
                        userId: true,
                        user: {select: {id: true, email: true, firstName: true, lastName: true}}
                    }
                },
                teamAssignment: {
                    include: {
                        assignment: true, // Gebruik de juiste veldnaam
                    },
                },
            },
        });
    }

    static async getTeamById(teamId: number) {
        return prisma.team.findUnique({
            where: {id: teamId},
            include: {
                students: {
                    select: {
                        userId: true,
                        user: {select: {id: true, email: true, firstName: true, lastName: true}}
                    }
                }
            }
        });
    }
}
