import {Assignment, PrismaClient, Role} from "@prisma/client";
import {isAuthorized} from "./authorizationService";

const prisma = new PrismaClient();

export const createAssignmentForClass = async (teacherId: number, classId: number, learningPathId: number): Promise<Assignment> => {

    if (!await isAuthorized(teacherId, Role.TEACHER, classId)) {
        throw new Error("The teacher is unauthorized to perform this action");
    }

    const assignment: Assignment = await prisma.assignment.create({
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

export const getAssignmentsByClass = async(classId: number, teacherId: number): Promise<Assignment[]> => {

    if (!await isAuthorized(teacherId, Role.TEACHER)) {
        throw new Error("The teacher is unauthorized to request the assignments");
    }

    const classAssignments = await prisma.classAssignment.findMany({
        where: {classId},
        include: {assignment: true},
    });

    return classAssignments.map(ca => ca.assignment);
}

export const updateAssignment = async(assignmentId: number, learningPathId: number, teacherId: number): Promise<Assignment> => {

    if (!await isAuthorized(teacherId, Role.TEACHER)) {
        throw new Error("The teacher is unauthorized to update the assignment");
    }

    return prisma.assignment.update({
        where: {id: assignmentId},
        data: {learningPathId},
    });
}

export const deleteAssignment = async (assignmentId: number, teacherId: number): Promise<Assignment> => {

    if (!await isAuthorized(teacherId, Role.TEACHER)) {
        throw new Error("The teacher is unauthorized to delete the assignment");
    }

    return prisma.assignment.delete({
        where: { id: assignmentId },
    });
};
