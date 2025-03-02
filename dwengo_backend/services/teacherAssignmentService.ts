import {Assignment, PrismaClient} from "@prisma/client";

const prisma = new PrismaClient();

export const createAssignmentForClass = async (teacherId: number, classId: number, learningPathId: number): Promise<Assignment> => {
    const assignment = await prisma.assignment.create({
        data: {
            learningPathId,
        },
    });

    await prisma.classAssignment.create({
        data: {
            classId,
            assignmentId: assignment.id, // Use the created assignment ID
        },
        include: {
            assignment: true,
        },
    });

    return assignment;
}

export const getAssignmentsByClass = async(classId: number): Promise<Assignment[]> => {
    const classAssignments = await prisma.classAssignment.findMany({
        where: {classId},
        include: {assignment: true},
    });

    return classAssignments.map(ca => ca.assignment);
}

export const updateAssignment = async(assignmentId: number, learningPathId: number): Promise<Assignment> => {
    return prisma.assignment.update({
        where: {id: assignmentId},
        data: {learningPathId},
    });
}

export const deleteAssignment = async (assignmentId: number) => {
    return prisma.$transaction([
        prisma.classAssignment.deleteMany({
            where: { assignmentId },
        }),
        prisma.teamAssignment.deleteMany({
            where: { assignmentId },
        }),
        prisma.assignment.delete({
            where: { id: assignmentId },
        }),
    ]);
};
