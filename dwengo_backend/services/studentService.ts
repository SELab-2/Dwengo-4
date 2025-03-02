import { PrismaClient, Student } from "@prisma/client";

const prisma = new PrismaClient();

export const getStudentsByClass = async (classId: number): Promise<Student[]> => {
    const classData = await prisma.class.findUnique({
        where: { id: classId },
        include: {
            classLinks: {
                include: {
                    student: {
                        include: { user: true }, // Inclusief gebruikersinformatie
                    },
                },
            },
        },
    });

    return classData?.classLinks.map(cs => cs.student) || [];
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
