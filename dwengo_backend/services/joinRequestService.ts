import { JoinRequest, JoinRequestStatus, Prisma } from "@prisma/client";
import classService, { ClassWithLinks } from "./classService";
import { ConflictError } from "../errors/errors";

import prisma from "../config/prisma";
import {
  handlePrismaQuery,
  handlePrismaTransaction,
  handleQueryWithExistenceCheck,
} from "../errors/errorFunctions";

export default class joinRequestService {
  // Validate whether the class exists before proceeding
  private static async validateClassExists(
    joinCode: string,
  ): Promise<ClassWithLinks> {
    return await classService.getClassByJoinCode(joinCode);
  }

  private static async updateAndValidateRequest(
    requestId: number,
    teacherId: number,
    classId: number,
    status: JoinRequestStatus,
    tx?: Prisma.TransactionClient,
  ): Promise<JoinRequest> {
    const prismaClient = tx || prisma;
    // check if the teacher is allowed to approve/deny the request
    await classService.isTeacherOfClass(classId, teacherId);

    await handleQueryWithExistenceCheck(
      () =>
        prismaClient.joinRequest.findFirst({
          where: { requestId, classId, status: JoinRequestStatus.PENDING },
        }),
      `Join request for this class is not found or is not pending.`,
    );

    // Update the join request status
    return handlePrismaQuery(() =>
      prismaClient.joinRequest.update({
        where: { requestId },
        data: { status: status },
      }),
    );
  }

  static async createJoinRequest(
    studentId: number,
    classId: number,
  ): Promise<JoinRequest> {
    return await handlePrismaQuery(() =>
      prisma.joinRequest.create({
        data: {
          studentId,
          classId: classId,
          status: JoinRequestStatus.PENDING,
        },
      }),
    );
  }

  static async createValidJoinRequest(
    studentId: number,
    joinCode: string,
  ): Promise<JoinRequest> {
    const classroom: ClassWithLinks = await this.validateClassExists(joinCode);

    // check if the student is already a member of the class
    classService.alreadyMemberOfClass(classroom, studentId);

    // check if there's already a pending join request for this student and class
    const existingRequest: JoinRequest | null = await handlePrismaQuery(() =>
      prisma.joinRequest.findFirst({
        where: {
          studentId,
          classId: classroom.id,
          status: JoinRequestStatus.PENDING,
        },
      }),
    );
    if (existingRequest) {
      throw new ConflictError(
        `There's already a pending join request for this student and this class.`,
      );
    }

    return await this.createJoinRequest(studentId, classroom.id);
  }

  static async approveRequestAndAddStudentToClass(
    requestId: number,
    teacherId: number,
    classId: number,
  ): Promise<JoinRequest> {
    return await handlePrismaTransaction(prisma, async (tx) => {
      // Update and validate the join request
      const updatedRequest = await this.updateAndValidateRequest(
        requestId,
        teacherId,
        classId,
        JoinRequestStatus.APPROVED,
        tx, // Pass the transaction client to the function
      );

      // Add the student to the class
      await classService.addStudentToClass(
        updatedRequest.studentId,
        classId,
        tx,
      ); // Pass tx here as well

      return updatedRequest;
    });
  }

  static async denyJoinRequest(
    requestId: number,
    teacherId: number,
    classId: number,
  ): Promise<JoinRequest> {
    return await this.updateAndValidateRequest(
      requestId,
      teacherId,
      classId,
      JoinRequestStatus.DENIED,
    );
  }

  static async getJoinRequestsByClass(
    teacherId: number,
    classId: number,
  ): Promise<JoinRequest[]> {
    await classService.isTeacherOfClass(classId, teacherId);

    return await handlePrismaQuery(() =>
      prisma.joinRequest.findMany({
        where: { classId },
        include: {
          student: {
            select: {
              user: {
                select: {
                  firstName: true,
                  lastName: true,
                  email: true,
                },
              },
            },
          },
        },
      }),
    ).then((requests) =>
      requests.map((request) => ({
        requestId: request.requestId,
        studentId: request.studentId,
        classId: request.classId,
        status: request.status,
        student: request.student?.user
          ? {
              firstName: request.student.user.firstName,
              lastName: request.student.user.lastName,
              email: request.student.user.email,
            }
          : undefined,
      })),
    );
  }
}
