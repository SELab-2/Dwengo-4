import {PrismaClient, JoinRequestStatus, JoinRequest} from "@prisma/client";
import * as classService from "./classService";
import {ClassWithLinks} from "./classService";

const prisma = new PrismaClient();

export default class joinRequestService {
    static async createJoinRequest(studentId: number, classCode: string): Promise<JoinRequest> {
        const classroom: ClassWithLinks | null = await classService.getClassByJoinCode(classCode);
        if (!classroom) throw new Error("Class not found.");

        return prisma.joinRequest.create({
            data: {
                studentId,
                classId: classroom.id,
                status: JoinRequestStatus.PENDING,
            },
        });
    };

    static async approveRequestAndAddStudentToClass (studentId: number, classId: number): Promise<void> {
        try {
            await prisma.joinRequest.update({
                where: { studentId_classId: { studentId, classId } },
                data: { status: JoinRequestStatus.APPROVED },
            });

            await classService.addStudentToClass(studentId, classId);
        } catch (error) {
            throw new Error("Join request not found or update failed.");
        }
    };

    static async denyJoinRequest(studentId: number, classId: number): Promise<void> {
        try {
            await prisma.joinRequest.update({
                where: { studentId_classId: { studentId, classId } },
                data: { status: JoinRequestStatus.DENIED },
            });
        } catch (error) {
            throw new Error("Join request not found or update failed.");
        }
    };

    static async getJoinRequestsByClass(classId: number): Promise<JoinRequest[]> {
        return prisma.joinRequest.findMany({
            where: { classId },
            include: { student: true },
        });
    };
}