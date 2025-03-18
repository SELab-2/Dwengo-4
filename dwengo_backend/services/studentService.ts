import {PrismaClient, Student} from "@prisma/client";

const prisma = new PrismaClient();

export const findStudentById = async (userId: number, inclusions: any): Promise<Student> => {
    return prisma.student.findUniqueOrThrow({
        where: {userId: userId},
        include: inclusions,
    });
}

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
            Team: {
                some: {
                    id: teamId,
                    teamAssignment: {
                        assignmentId: assignmentId
                    }
                }
            }
        },
        include: {
            user: true
        }
    });
};
