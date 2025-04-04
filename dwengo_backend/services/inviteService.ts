import { Invite, JoinRequestStatus, Class } from "@prisma/client";
import classService from "./classService";
import {
  AccesDeniedError,
  BadRequestError,
  ConflictError,
  NotFoundError,
  UnauthorizedError,
} from "../errors/errors";
import {
  handlePrismaQuery,
  handlePrismaTransaction,
} from "../errors/errorFunctions";

import prisma from "../config/prisma";

export default class inviteService {
  private static async validateInvitePending(
    inviteId: number,
    otherTeacherId: number,
  ): Promise<Invite> {
    const invite: Invite | null = await handlePrismaQuery(() =>
      prisma.invite.findFirst({
        where: {
          inviteId,
          otherTeacherId,
          status: JoinRequestStatus.PENDING,
        },
      }),
    );
    if (!invite) {
      throw new BadRequestError("Invite is not pending or does not exist.");
    }
    return invite;
  }

  static async createInvite(
    classTeacherId: number,
    otherTeacherEmail: string,
    classId: number,
  ): Promise<Invite> {
    // Check if de klas bestaat
    const classroom: Class | null = await classService.getClassById(classId);
    if (!classroom) {
      throw new NotFoundError("Class not found.");
    }

    // Check of de leerkracht die de invite verstuurt beheerder is van de klas
    const isTeacher: boolean = await classService.isTeacherOfClass(
      classId,
      classTeacherId,
    );
    if (!isTeacher) {
      throw new UnauthorizedError("Teacher is not a teacher of this class.");
    }

    console.log(`isTeacher: ${isTeacher}`);

    // Zoek de leerkracht op basis van het e-mailadres
    const teacherUser = await handlePrismaQuery(() =>
      prisma.user.findUnique({
        where: { email: otherTeacherEmail },
      }),
    );
    if (!teacherUser) {
      throw new NotFoundError("Teacher not found.");
    }
    if (teacherUser.role !== "TEACHER") {
      throw new UnauthorizedError(
        "User is not a teacher. Only teachers can receive invites.",
      );
    }
    const otherTeacherId = teacherUser.id;

    // Controleer of er al een pending invite bestaat voor deze teacher en klas
    const existingInvite: Invite | null = await handlePrismaQuery(() =>
      prisma.invite.findFirst({
        where: {
          otherTeacherId,
          classId,
          status: JoinRequestStatus.PENDING,
        },
      }),
    );
    if (existingInvite) {
      throw new ConflictError(
        "There is already a pending invite for this teacher and class.",
      );
    }

    // Controleer of de teacher nog geen lid is van de klas
    const isAlreadyTeacher: boolean = await classService.isTeacherOfClass(
      classId,
      otherTeacherId,
    );
    if (isAlreadyTeacher) {
      throw new BadRequestError("Teacher is already a member of this class.");
    }

    // Maak de invite aan
    return await handlePrismaQuery(() =>
      prisma.invite.create({
        data: {
          otherTeacherId,
          classTeacherId,
          classId,
          status: JoinRequestStatus.PENDING,
        },
      }),
    );
  }

  static async getPendingInvitesForClass(
    classTeacherId: number,
    classId: number,
  ): Promise<Invite[]> {
    // Alleen een teacher van de klas mag de invites zien
    const isTeacher: boolean = await classService.isTeacherOfClass(
      classId,
      classTeacherId,
    );
    if (!isTeacher) {
      throw new UnauthorizedError("Teacher is not a teacher of this class.");
    }
    return await handlePrismaQuery(() =>
      prisma.invite.findMany({
        where: {
          classId,
          status: JoinRequestStatus.PENDING,
        },
      }),
    );
  }

  static async getPendingInvitesForTeacher(
    teacherId: number,
  ): Promise<Invite[]> {
    return handlePrismaQuery(() =>
      prisma.invite.findMany({
        where: {
          otherTeacherId: teacherId,
          status: JoinRequestStatus.PENDING,
        },
      }),
    );
  }

  static async acceptInviteAndJoinClass(
    teacherId: number,
    inviteId: number,
  ): Promise<Invite> {
    // Check of de invite pending is
    const invite: Invite = await this.validateInvitePending(
      inviteId,
      teacherId,
    );

    return await handlePrismaTransaction(prisma, async (tx) => {
      // Accept de invite
      await tx.invite.update({
        where: {
          inviteId: invite.inviteId,
        },
        data: {
          status: JoinRequestStatus.APPROVED,
        },
      });
      // Voeg de teacher toe aan de klas
      await tx.classTeacher.create({
        data: {
          teacherId,
          classId: invite.classId,
        },
      });
      return invite;
    });
  }

  static async declineInvite(
    teacherId: number,
    inviteId: number,
  ): Promise<Invite> {
    // Check of de invite pending is
    const invite: Invite = await this.validateInvitePending(
      inviteId,
      teacherId,
    );

    // Decline de invite
    return await handlePrismaQuery(() =>
      prisma.invite.update({
        where: {
          inviteId: invite.inviteId,
        },
        data: {
          status: JoinRequestStatus.DENIED,
        },
      }),
    );
  }

  static async deleteInvite(
    classTeacherId: number,
    inviteId: number,
    classId: number,
  ): Promise<Invite> {
    // Check of de teacher een teacher van de klas is
    const isTeacher: boolean = await classService.isTeacherOfClass(
      classId,
      classTeacherId,
    );
    if (!isTeacher) {
      throw new AccesDeniedError("Leerkracht is geen beheerder van de klas");
    }

    // Verwijder de invite
    return await handlePrismaQuery(() =>
      prisma.invite.delete({
        where: {
          inviteId,
          classId,
        },
      }),
    );
  }
}
