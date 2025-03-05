import {PrismaClient, Student} from "@prisma/client";

const prisma = new PrismaClient();

export const getStudentsByClass = async (classId: number): Promise<Student[]> => {
    return prisma.student.findMany({
        where: {
            classes: {
                some: {
                    classId: classId,
                },
            },
        },
        include: {
            user: true, // Inclusief gebruikersinformatie
        },
    });
};


export const getStudentsByTeamAssignment = async (assignmentId: number, teamId: number): Promise<Student[]> => {
    const teamAssignments = await prisma.teamAssignment.findMany({
        where: { assignmentId, teamId },
        include: {
            member: {
                include: { user: true }, // Inclusief gebruikersinformatie
            },
        },
    });

    return teamAssignments.map(ta => ta.member);
};
