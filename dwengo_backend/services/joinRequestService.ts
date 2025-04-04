import { JoinRequestStatus, JoinRequest } from "@prisma/client";
import classService from "./classService";
import { ClassWithLinks } from "./classService";
import {
  AccesDeniedError,
  ConflictError,
  NotFoundError,
} from "../errors/errors";

import prisma from "../config/prisma";
import { handlePrismaQuery } from "../errors/errorFunctions";

export default class joinRequestService {
  // Validate whether the class exists before proceeding
  private static async validateClassExists(
    joinCode: string,
  ): Promise<ClassWithLinks> {
    const classroom: ClassWithLinks | null =
      await classService.getClassByJoinCode(joinCode);
    if (!classroom) {
      throw new NotFoundError(`Class with code ${joinCode} not found.`);
    }
    return classroom;
  }

  private static async updateAndValidateRequest(
    requestId: number,
    teacherId: number,
    classId: number,
    status: JoinRequestStatus,
  ): Promise<JoinRequest> {
    // check if teacher is allowed to approve/deny the request
    const isTeacher: boolean = await classService.isTeacherOfClass(
      classId,
      teacherId,
    );
    if (!isTeacher) {
      throw new AccesDeniedError(
        `Teacher ${teacherId} is not a teacher of class ${classId}.`,
      );
    }

    const joinRequest: JoinRequest | null = await handlePrismaQuery(() =>
      prisma.joinRequest.findFirst({
        where: { requestId, classId, status: JoinRequestStatus.PENDING },
      }),
    );
    if (!joinRequest) {
      throw new NotFoundError(
        `Join request ${requestId} for class ${classId} not found/not pending.`,
      );
    }

    // Update the join request status
    const updatedRequest = await handlePrismaQuery(() =>
      prisma.joinRequest.update({
        where: { requestId },
        data: { status: status },
      }),
    );

    return updatedRequest;
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
    if (await classService.isStudentInClass(classroom, studentId)) {
      throw new ConflictError(
        `Student ${studentId} is already a member of class ${classroom.id}.`,
      );
    }

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
        `There's already a pending join request for student ${studentId} and class ${classroom.id}`,
      );
    }

    return await this.createJoinRequest(studentId, classroom.id);
  }

  static async approveRequestAndAddStudentToClass(
    requestId: number,
    teacherId: number,
    classId: number,
  ): Promise<JoinRequest> {
    const updatedRequest: JoinRequest = await this.updateAndValidateRequest(
      requestId,
      teacherId,
      classId,
      JoinRequestStatus.APPROVED,
    );

    // Add the student to the class
    await classService.addStudentToClass(updatedRequest.studentId, classId);
    return updatedRequest;
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
    const isTeacher: boolean = await classService.isTeacherOfClass(
      classId,
      teacherId,
    );
    if (!isTeacher) {
      throw new AccesDeniedError(
        `Teacher ${teacherId} is not a teacher of class ${classId}.`,
      );
    }

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
