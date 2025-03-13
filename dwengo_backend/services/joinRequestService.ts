import {PrismaClient, JoinRequestStatus, JoinRequest} from "@prisma/client";
import classService from "./classService";
import {ClassWithLinks} from "./classService";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { AccesDeniedError, BadRequestError, NotFoundError } from "../errors/errors";

const prisma = new PrismaClient();

export default class joinRequestService {

    // Validate whether the class exists before proceeding
    private static async validateClassExists(classCode: string): Promise<ClassWithLinks> {
        const classroom: ClassWithLinks | null = await classService.getClassByJoinCode(classCode);
        if (!classroom) {
            throw new NotFoundError(`Class with code ${classCode} not found.`);
        }
        return classroom;
    }

    private static async updateAndValidateRequest(requestId: number, teacherId: number, classId: number, status: JoinRequestStatus): Promise<JoinRequest> {
        // check if teacher is allowed to approve/deny the request
        const isTeacher: boolean = await classService.isTeacherOfClass(classId, teacherId);
        if (!isTeacher) {
            throw new AccesDeniedError(`Teacher ${teacherId} is not a teacher of class ${classId}`);
        }

        const joinRequest: JoinRequest | null = await prisma.joinRequest.findFirst({
            where: { requestId, classId, status: JoinRequestStatus.PENDING },
        });
        if (!joinRequest) {
            throw new NotFoundError(`Join request ${requestId} for class ${classId} not found/not pending.`);
        }
        
        // Update the join request status
        const updatedRequest = await prisma.joinRequest.update({
            where: { requestId },
            data: { status: status },
        });

        return updatedRequest;
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

            // check if the student is already a member of the class
            if (await classService.isStudentInClass(classroom, studentId)) {
                throw new BadRequestError(`Student ${studentId} is already a member of class ${classroom.id}`);
            }

            // check if there's already a pending join request for this student and class
            const existingRequest: JoinRequest | null = await prisma.joinRequest.findFirst({
                where: {
                    studentId,
                    classId: classroom.id,
                    status: JoinRequestStatus.PENDING,
                },
            });
            if (existingRequest) {
                throw new BadRequestError(`There's already a pending join request for student ${studentId} and class ${classroom.id}`);
            }

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

    static async approveRequestAndAddStudentToClass(requestId: number, teacherId: number, classId: number): Promise<JoinRequest> {
        try {
            const updatedRequest: JoinRequest = await this.updateAndValidateRequest(requestId, teacherId, classId, JoinRequestStatus.APPROVED);

            // Add the student to the class
            await classService.addStudentToClass(updatedRequest.studentId, classId);
            return updatedRequest;
        } catch (error) {
            this.handleError(error, `Error approving join request ${requestId} for class ${classId}`);
            throw error;
        }
    };

    static async denyJoinRequest(requestId: number, teacherId: number, classId: number): Promise<JoinRequest> {
        try {
            return await this.updateAndValidateRequest(requestId, teacherId, classId, JoinRequestStatus.DENIED);
        } catch (error) {
            this.handleError(error, `Error denying join request ${requestId} for class ${classId}`);
            throw error;
        }
    };

    static async getJoinRequestsByClass(teacherId: number, classId: number): Promise<JoinRequest[]> {
        try {
            const isTeacher: boolean = await classService.isTeacherOfClass(classId, teacherId);
            if (!isTeacher) {
                throw new AccesDeniedError(`Teacher ${teacherId} is not a teacher of class ${classId}`);
            }
            return await prisma.joinRequest.findMany({
                where: { classId }
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
            error.message = `${message}: ${error.message}`;
            throw error;
        }
        throw new Error(`${message}: Unknown error occurred.`);
    }
}
