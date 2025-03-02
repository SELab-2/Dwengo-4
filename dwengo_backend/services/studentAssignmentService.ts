import {Assignment, PrismaClient} from "@prisma/client";

const prisma = new PrismaClient();

export const getAssignmentsForStudent = async (studentId: number): Promise<Assignment[]> => {
    return prisma.assignment.findMany({
        where: {
            classAssignments: {
                some: {
                    class: {
                        classLinks: {
                            some: {
                                studentId: studentId,
                            },
                        },
                    },
                },
            },
        },
        include: {
            learningPath: true,
        },
    });
};

export const getAssignmentsWithClosestDeadlines = async (studentId: number, limit: number): Promise<Assignment[]> => {
    const studentAssignments = await prisma.assignment.findMany({
        where: {
            teamAssignments: {
                some: {
                    memberId: studentId
                }
            }
        }
    });

    // Sort assignments by the closest deadline
    studentAssignments.sort((a: Assignment, b: Assignment) => {
        const deadlineA = a.deadline;
        const deadlineB = b.deadline;
        return deadlineA.getTime() - deadlineB.getTime();
    });

    // Take the "x" most urgent assignments
    return studentAssignments.slice(0, limit);
};




