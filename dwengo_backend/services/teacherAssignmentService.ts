import {Assignment, PrismaClient, Role} from "@prisma/client";
import {isAuthorized} from "./authorizationService";

const prisma = new PrismaClient();

export default class TeacherAssignmentService {
    // Static method to create an assignment for a class
    static async createAssignmentForClass(teacherId: number, classId: number, learningPathId: number): Promise<Assignment> {
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

    // Static method to get assignments by class
    static async getAssignmentsByClass(classId: number, teacherId: number): Promise<Assignment[]> {
        if (!await isAuthorized(teacherId, Role.TEACHER)) {
            throw new Error("The teacher is unauthorized to request the assignments");
        }

        const classAssignments = await prisma.classAssignment.findMany({
            where: { classId },
            include: { assignment: true },
        });

        return classAssignments.map(ca => ca.assignment);
    }

    // Static method to update an assignment
    static async updateAssignment(assignmentId: number, learningPathId: number, teacherId: number): Promise<Assignment> {
        if (!await isAuthorized(teacherId, Role.TEACHER)) {
            throw new Error("The teacher is unauthorized to update the assignment");
        }

        return prisma.assignment.update({
            where: { id: assignmentId },
            data: { learningPathId },
        });
    }

    // Static method to delete an assignment
    static async deleteAssignment(assignmentId: number, teacherId: number): Promise<Assignment> {
        if (!await isAuthorized(teacherId, Role.TEACHER)) {
            throw new Error("The teacher is unauthorized to delete the assignment");
        }

        return prisma.assignment.delete({
            where: { id: assignmentId },
        });
    }
}
