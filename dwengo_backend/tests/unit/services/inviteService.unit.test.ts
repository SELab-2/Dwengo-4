// dwengo_backend/tests/unit/services/inviteService.unit.test.ts

import { beforeEach, describe, expect, it, vi } from "vitest";
import inviteService from "../../../services/inviteService";
import prisma from "../../../config/__mocks__/prisma";
import classService from "../../../services/classService";
import {
  AccessDeniedError,
  BadRequestError,
  ConflictError,
  NotFoundError,
  UnauthorizedError,
} from "../../../errors/errors";
import { JoinRequestStatus } from "@prisma/client";

vi.mock("../../../config/prisma");
vi.mock("../../../services/classService");

const mockInvite = {
  inviteId: 1,
  classId: 1,
  classTeacherId: 2,
  otherTeacherId: 3,
  status: JoinRequestStatus.PENDING,
};

describe("inviteService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createInvite", () => {
    it("throws if class not found", async () => {
      (classService.getClassById as ReturnType<typeof vi.fn>).mockResolvedValue(
        null,
      );
      await expect(
        inviteService.createInvite(1, "teacher@example.com", 1),
      ).rejects.toThrow(NotFoundError);
    });

    it("throws if classTeacher is not teacher of class", async () => {
      (classService.getClassById as ReturnType<typeof vi.fn>).mockResolvedValue(
        { id: 1 } as any,
      );
      (
        classService.isTeacherOfClass as ReturnType<typeof vi.fn>
      ).mockRejectedValue(new AccessDeniedError("not allowed"));
      await expect(
        inviteService.createInvite(1, "teacher@example.com", 1),
      ).rejects.toThrow(AccessDeniedError);
    });

    it("throws if email doesn't belong to teacher", async () => {
      (classService.getClassById as ReturnType<typeof vi.fn>).mockResolvedValue(
        { id: 1 } as any,
      );
      (
        classService.isTeacherOfClass as ReturnType<typeof vi.fn>
      ).mockResolvedValue(undefined);
      (prisma.user.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(
        null,
      );
      await expect(
        inviteService.createInvite(1, "noone@none.com", 1),
      ).rejects.toThrow(NotFoundError);
    });

    it("throws if role is not TEACHER", async () => {
      (classService.getClassById as ReturnType<typeof vi.fn>).mockResolvedValue(
        { id: 1 } as any,
      );
      (
        classService.isTeacherOfClass as ReturnType<typeof vi.fn>
      ).mockResolvedValue(undefined);
      (prisma.user.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
        id: 99,
        role: "STUDENT",
        firstName: "S",
        lastName: "S",
        email: "s@e.com",
        password: "123",
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      await expect(
        inviteService.createInvite(1, "student@example.com", 1),
      ).rejects.toThrow(UnauthorizedError);
    });

    it("throws if there is an existing pending invite", async () => {
      (classService.getClassById as ReturnType<typeof vi.fn>).mockResolvedValue(
        { id: 1 } as any,
      );
      (
        classService.isTeacherOfClass as ReturnType<typeof vi.fn>
      ).mockResolvedValue(undefined);
      (prisma.user.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
        id: 3,
        role: "TEACHER",
        firstName: "Jane",
        lastName: "Doe",
        email: "jane@example.com",
        password: "secret",
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      (prisma.invite.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockInvite,
      );
      await expect(
        inviteService.createInvite(1, "jane@example.com", 1),
      ).rejects.toThrow(ConflictError);
    });
  });

  describe("getPendingInvitesForClass", () => {
    it("throws if not class teacher", async () => {
      (
        classService.isTeacherOfClass as ReturnType<typeof vi.fn>
      ).mockRejectedValue(new AccessDeniedError("not allowed"));
      await expect(
        inviteService.getPendingInvitesForClass(1, 1),
      ).rejects.toThrow(AccessDeniedError);
    });

    it("returns invites for class", async () => {
      (
        classService.isTeacherOfClass as ReturnType<typeof vi.fn>
      ).mockResolvedValue(undefined);
      (prisma.invite.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([
        mockInvite,
      ]);
      const result = await inviteService.getPendingInvitesForClass(1, 1);
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(mockInvite);
    });
  });

  describe("getPendingInvitesForTeacher", () => {
    it("returns invites", async () => {
      (prisma.invite.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([
        mockInvite,
      ]);
      const result = await inviteService.getPendingInvitesForTeacher(3);
      expect(result).toEqual([mockInvite]);
    });
  });

  describe("acceptInviteAndJoinClass", () => {
    it("throws if invite not valid", async () => {
      (prisma.invite.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(
        null,
      );
      await expect(
        inviteService.acceptInviteAndJoinClass(3, 1),
      ).rejects.toThrow(BadRequestError);
    });

    it("accepts invite and creates classTeacher", async () => {
      (prisma.invite.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockInvite,
      );
      (prisma.$transaction as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockInvite,
      );
      const result = await inviteService.acceptInviteAndJoinClass(3, 1);
      expect(result).toEqual(mockInvite);
    });
  });

  describe("declineInvite", () => {
    it("throws if invite is not valid", async () => {
      (prisma.invite.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(
        null,
      );
      await expect(inviteService.declineInvite(3, 1)).rejects.toThrow(
        BadRequestError,
      );
    });

    it("declines invite", async () => {
      (prisma.invite.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockInvite,
      );
      (prisma.invite.update as ReturnType<typeof vi.fn>).mockResolvedValue({
        ...mockInvite,
        status: JoinRequestStatus.DENIED,
      });
      const result = await inviteService.declineInvite(3, 1);
      expect(result.status).toBe(JoinRequestStatus.DENIED);
    });
  });

  describe("deleteInvite", () => {
    it("throws if not class teacher", async () => {
      (
        classService.isTeacherOfClass as ReturnType<typeof vi.fn>
      ).mockRejectedValue(new AccessDeniedError("not allowed"));
      await expect(inviteService.deleteInvite(2, 1, 1)).rejects.toThrow(
        AccessDeniedError,
      );
    });

    it("deletes invite", async () => {
      (
        classService.isTeacherOfClass as ReturnType<typeof vi.fn>
      ).mockResolvedValue(undefined);
      (prisma.invite.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockInvite,
      );
      (prisma.invite.delete as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockInvite,
      );
      const result = await inviteService.deleteInvite(2, 1, 1);
      expect(result).toEqual(mockInvite);
    });
  });
});
