import {PrismaClient, Student} from "@prisma/client";

const prisma = new PrismaClient();

export const getStudentsByClass = async (classId: number): Promise<Student[]> => {
    const classWithStudents = await prisma.class.findUnique({
        where: { id: classId },
        include: { classLinks: { include: { student: { include: { user: true } } } } },
    });

    if (!classWithStudents) {
        throw new Error(`Class with ID: ${classId} not found`);
    }

    return classWithStudents.classLinks.map(cs => cs.student);
};


export const getStudentsByTeamAssignment = async (assignmentId: number, teamId: number): Promise<Student[]> => {
    return prisma.student.findMany({
        where: {
            teamAssignments: {
                some: { // Check if the student has any team assignment matching the criteria
                    assignmentId,
                    teamId,
                },
            },
        },
        include: {
            user: true, // Include user info if needed
            teamAssignments: true, // Include the student's team assignments if necessary
        },
    });
};
