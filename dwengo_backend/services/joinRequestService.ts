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

    static async createJoinRequest(studentId: number, classId: number): Promise<JoinRequest> {
        return prisma.joinRequest.create({
            data: {
                studentId,
                classId: classId,
                status: JoinRequestStatus.PENDING,
            },
        });
    }


    static async createValidJoinRequest(studentId: number, classCode: string): Promise<JoinRequest> {
        try {
            const classroom: ClassWithLinks = await this.validateClassExists(classCode);

            return await this.createJoinRequest(studentId, classroom.id);
        } catch (error) {
            this.handleError(error, "Error creating join request");
            // Without this Typescript does not accept the return type to just be Promise<JoinRequest>
            // but also wants it to be optionally "undefined".
            // Since I don't want that, I will just log the error here, and then pass the error to the
            // JoinRequestController which will handle accordingly.
            throw error;
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

    static async getJoinRequestsByClass(classId: number): Promise<JoinRequest[]> {
        try {
            return await prisma.joinRequest.findMany({
                where: { classId },
                include: { student: true },
            });
        } catch (error) {
            this.handleError(error, `Error fetching join requests for class ${classId}`);
            return [];
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