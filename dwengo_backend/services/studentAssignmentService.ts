import {Assignment, PrismaClient} from "@prisma/client";

const prisma = new PrismaClient();

export const getAssignmentsForStudent = async (studentId: number, sortFields: string[], order: "asc" | "desc", limit: number): Promise<Assignment[]> => {
    return prisma.assignment.findMany({
        where: {
            teamAssignments: {
                some: { memberId: studentId }
            }
        },
        // Sort by multiple fields
        orderBy: sortFields.map((field: string): {[x: string]: "asc" | "desc"} => ({ [field]: order })),
        take: limit,
        include: { learningPath: true },
    });
};
