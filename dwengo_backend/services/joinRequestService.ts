import {PrismaClient, JoinRequestStatus, JoinRequest} from "@prisma/client";
import classService from "./classService";
import {ClassWithLinks} from "./classService";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

const prisma = new PrismaClient();

export default class joinRequestService {

    // Validate whether the class exists before proceeding
    private static async validateClassExists(classCode: string): Promise<ClassWithLinks> {
        const classroom: ClassWithLinks | null = await classService.getClassByJoinCode(classCode);
        if (!classroom) {
            throw new Error(`Class with code ${classCode} not found.`);
        }
        return classroom;
    }

    private static async updateAndValidateRequest(studentId: number, classId: number, status: JoinRequestStatus): Promise<void> {
        // Update the join request status
        const updatedRequest = await prisma.joinRequest.update({
            where: { studentId_classId: { studentId, classId } },
            data: { status: status },
        });

        if (!updatedRequest) {
            throw new Error(`Join request for student ${studentId} and class ${classId} not found.`);
        }
    }


    static async createJoinRequest(studentId: number, classCode: string): Promise<JoinRequest | undefined> {
        try {
            const classroom: ClassWithLinks = await this.validateClassExists(classCode);

            return await prisma.joinRequest.create({
                data: {
                    studentId,
                    classId: classroom.id,
                    status: JoinRequestStatus.PENDING,
                },
            });
        } catch (error) {
            this.handleError(error, "Error creating join request");
        }
    };

    static async approveRequestAndAddStudentToClass (studentId: number, classId: number): Promise<void> {
        try {
            await this.updateAndValidateRequest(studentId, classId, JoinRequestStatus.APPROVED);

            // Add the student to the class
            await classService.addStudentToClass(studentId, classId);
        } catch (error) {
            this.handleError(error, `Error approving join request for student ${studentId} and class ${classId}`);
        }
    };

    static async denyJoinRequest(studentId: number, classId: number): Promise<void> {
        try {
            await this.updateAndValidateRequest(studentId, classId, JoinRequestStatus.DENIED);
        } catch (error) {
            this.handleError(error, `Error denying join request for student ${studentId} and class ${classId}`);
        }
    };

    static async getJoinRequestsByClass(classId: number): Promise<JoinRequest[] | undefined> {
        try {
            return await prisma.joinRequest.findMany({
                where: { classId },
                include: { student: true },
            });
        } catch (error) {
            this.handleError(error, `Error fetching join requests for class ${classId}`);
        }
    }

    private static handleError(error: any, message: string): void {
        if (error instanceof PrismaClientKnownRequestError) {
            throw new Error(`Prisma error occurred: ${error.message}`);
        } else if (error instanceof Error) {
            throw new Error(`${message}: ${error.message}`);
        }
        throw new Error(`${message}: Unknown error occurred.`);
    }
}