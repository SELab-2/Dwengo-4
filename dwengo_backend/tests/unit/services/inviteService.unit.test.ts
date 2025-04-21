import { describe, it, expect, vi, beforeEach } from "vitest";
import inviteService from "../../../services/inviteService";
import prisma from "../../../config/prisma";
import classService from "../../../services/classService";
import {
  BadRequestError,
  ConflictError,
  NotFoundError,
  AccesDeniedError,
} from "../../../errors/errors";
import { JoinRequestStatus, Role } from "@prisma/client";

vi.mock("../../../config/prisma", () => ({
  default: {
    invite: {
      findFirst: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    user: {
      findUnique: vi.fn(),
    },
    classTeacher: {
      create: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

vi.mock("../../../services/classService", () => ({
  default: {
    getClassById: vi.fn(),
    isTeacherOfClass: vi.fn(),
  },
}));

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
      vi.mocked(classService.getClassById).mockResolvedValue(null);
      await expect(inviteService.createInvite(1, "teacher@example.com", 1)).rejects.toThrow(NotFoundError);
    });

    it("throws if classTeacher is not teacher of class", async () => {
      vi.mocked(classService.getClassById).mockResolvedValue({ id: 1 } as any);
      vi.mocked(classService.isTeacherOfClass).mockResolvedValue(false);
      await expect(inviteService.createInvite(1, "teacher@example.com", 1)).rejects.toThrow(AccesDeniedError);
    });

    it("throws if email doesn't belong to teacher", async () => {
      vi.mocked(classService.getClassById).mockResolvedValue({ id: 1 } as any);
      vi.mocked(classService.isTeacherOfClass).mockResolvedValue(true);
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
      await expect(inviteService.createInvite(1, "noone@none.com", 1)).rejects.toThrow(NotFoundError);
    });

    it("throws if role is not TEACHER", async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: 99,
        role: "STUDENT",
        firstName: "S",
        lastName: "S",
        email: "s@e.com",
        password: "123",
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      await expect(inviteService.createInvite(1, "student@example.com", 1)).rejects.toThrow(NotFoundError);
    });

    it("throws if there is an existing pending invite", async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: 3,
        role: "TEACHER",
        firstName: "Jane",
        lastName: "Doe",
        email: "jane@example.com",
        password: "secret",
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      vi.mocked(prisma.invite.findFirst).mockResolvedValue(mockInvite);
      await expect(inviteService.createInvite(1, "jane@example.com", 1)).rejects.toThrow(ConflictError);
    });

    

    
  });

  describe("getPendingInvitesForClass", () => {
    it("throws if not class teacher", async () => {
      vi.mocked(classService.isTeacherOfClass).mockResolvedValue(false);
      await expect(inviteService.getPendingInvitesForClass(1, 1)).rejects.toThrow(AccesDeniedError);
    });

    it("returns invites for class", async () => {
      vi.mocked(classService.isTeacherOfClass).mockResolvedValue(true);
      vi.mocked(prisma.invite.findMany).mockResolvedValue([mockInvite]);
      const result = await inviteService.getPendingInvitesForClass(1, 1);
      expect(result).toHaveLength(1);
    });
  });

  describe("getPendingInvitesForTeacher", () => {
    it("returns invites", async () => {
      vi.mocked(prisma.invite.findMany).mockResolvedValue([mockInvite]);
      const result = await inviteService.getPendingInvitesForTeacher(3);
      expect(result).toEqual([mockInvite]);
    });
  });

  describe("acceptInviteAndJoinClass", () => {
    it("throws if invite not valid", async () => {
      vi.mocked(prisma.invite.findFirst).mockResolvedValue(null);
      await expect(inviteService.acceptInviteAndJoinClass(3, 1)).rejects.toThrow(BadRequestError);
    });

    it("accepts invite and creates classTeacher", async () => {
      vi.mocked(prisma.invite.findFirst).mockResolvedValue(mockInvite);
      vi.mocked(prisma.$transaction).mockResolvedValue([mockInvite]);
      const result = await inviteService.acceptInviteAndJoinClass(3, 1);
      expect(result).toEqual(mockInvite);
    });
  });

  describe("declineInvite", () => {
    it("throws if invite is not valid", async () => {
      vi.mocked(prisma.invite.findFirst).mockResolvedValue(null);
      await expect(inviteService.declineInvite(3, 1)).rejects.toThrow(BadRequestError);
    });

    it("declines invite", async () => {
      vi.mocked(prisma.invite.findFirst).mockResolvedValue(mockInvite);
      vi.mocked(prisma.invite.update).mockResolvedValue({ ...mockInvite, status: JoinRequestStatus.DENIED });
      const result = await inviteService.declineInvite(3, 1);
      expect(result.status).toBe(JoinRequestStatus.DENIED);
    });
  });

  describe("deleteInvite", () => {
    it("throws if not class teacher", async () => {
      vi.mocked(classService.isTeacherOfClass).mockResolvedValue(false);
      await expect(inviteService.deleteInvite(2, 1, 1)).rejects.toThrow(AccesDeniedError);
    });

    it("deletes invite", async () => {
      vi.mocked(classService.isTeacherOfClass).mockResolvedValue(true);
      vi.mocked(prisma.invite.delete).mockResolvedValue(mockInvite);
      const result = await inviteService.deleteInvite(2, 1, 1);
      expect(result).toEqual(mockInvite);
    });
  });
});
