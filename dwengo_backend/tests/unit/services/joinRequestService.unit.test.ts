import { beforeEach, describe, expect, it, vi } from "vitest";
import joinRequestService from "../../../services/joinRequestService";
import prisma from "../../../config/prisma";
import classService from "../../../services/classService";
import { JoinRequestStatus } from "@prisma/client";
import {
  AccessDeniedError,
  BadRequestError,
  ConflictError,
} from "../../../errors/errors";

vi.mock("../../../config/prisma");
vi.mock("../../../services/classService");

describe("joinRequestService", () => {
  const studentId = 1;
  const teacherId = 2;
  const classId = 10;
  const joinCode = "JOIN123";
  const mockClass = { id: classId };

  beforeEach(() => {
    vi.clearAllMocks();
    (prisma.$transaction as ReturnType<typeof vi.fn>).mockImplementation(
      async (fn: any) => fn(prisma),
    );
  });

  describe("createJoinRequest", () => {
    it("creates a join request", async () => {
      const expected = {
        requestId: 1,
        studentId,
        classId,
        status: JoinRequestStatus.PENDING,
      };
      (prisma.joinRequest.create as ReturnType<typeof vi.fn>).mockResolvedValue(
        expected,
      );

      const result = await joinRequestService.createJoinRequest(
        studentId,
        classId,
      );
      expect(result).toEqual(expected);
    });
  });

  describe("createValidJoinRequest", () => {
    it("throws if student is already in class", async () => {
      (
        classService.getClassByJoinCode as ReturnType<typeof vi.fn>
      ).mockResolvedValue(mockClass);
      (
        classService.alreadyMemberOfClass as ReturnType<typeof vi.fn>
      ).mockImplementation(() => {
        throw new BadRequestError("Already in class");
      });

      await expect(
        joinRequestService.createValidJoinRequest(studentId, joinCode),
      ).rejects.toThrow(BadRequestError);
    });

    it("throws if pending request already exists", async () => {
      (
        classService.getClassByJoinCode as ReturnType<typeof vi.fn>
      ).mockResolvedValue(mockClass);
      (
        classService.alreadyMemberOfClass as ReturnType<typeof vi.fn>
      ).mockReturnValue(undefined);
      (
        prisma.joinRequest.findFirst as ReturnType<typeof vi.fn>
      ).mockResolvedValue({});

      await expect(
        joinRequestService.createValidJoinRequest(studentId, joinCode),
      ).rejects.toThrow(ConflictError);
    });

    it("creates valid request successfully", async () => {
      const expected = {
        requestId: 99,
        studentId,
        classId,
        status: JoinRequestStatus.PENDING,
      };
      (
        classService.getClassByJoinCode as ReturnType<typeof vi.fn>
      ).mockResolvedValue(mockClass);
      (
        classService.alreadyMemberOfClass as ReturnType<typeof vi.fn>
      ).mockReturnValue(undefined);
      (
        prisma.joinRequest.findFirst as ReturnType<typeof vi.fn>
      ).mockResolvedValue(null);
      (prisma.joinRequest.create as ReturnType<typeof vi.fn>).mockResolvedValue(
        expected,
      );

      const result = await joinRequestService.createValidJoinRequest(
        studentId,
        joinCode,
      );
      expect(result).toEqual(expected);
    });
  });

  describe("approveRequestAndAddStudentToClass", () => {
    it("updates request to approved and adds student to class", async () => {
      const req = {
        requestId: 1,
        studentId,
        classId,
        status: JoinRequestStatus.PENDING,
      };
      (
        classService.isTeacherOfClass as ReturnType<typeof vi.fn>
      ).mockResolvedValue(true);
      (
        classService.addStudentToClass as ReturnType<typeof vi.fn>
      ).mockResolvedValue(undefined);
      (
        prisma.joinRequest.findFirst as ReturnType<typeof vi.fn>
      ).mockResolvedValue(req);
      (prisma.joinRequest.update as ReturnType<typeof vi.fn>).mockResolvedValue(
        { ...req, status: JoinRequestStatus.APPROVED },
      );

      const result =
        await joinRequestService.approveRequestAndAddStudentToClass(
          req.requestId,
          teacherId,
          classId,
        );
      expect(result.status).toBe(JoinRequestStatus.APPROVED);
    });
  });

  describe("denyJoinRequest", () => {
    it("updates join request to denied", async () => {
      const req = {
        requestId: 2,
        studentId,
        classId,
        status: JoinRequestStatus.PENDING,
      };
      (
        classService.isTeacherOfClass as ReturnType<typeof vi.fn>
      ).mockResolvedValue(true);
      (
        prisma.joinRequest.findFirst as ReturnType<typeof vi.fn>
      ).mockResolvedValue(req);
      (prisma.joinRequest.update as ReturnType<typeof vi.fn>).mockResolvedValue(
        { ...req, status: JoinRequestStatus.DENIED },
      );

      const result = await joinRequestService.denyJoinRequest(
        req.requestId,
        teacherId,
        classId,
      );
      expect(result.status).toBe(JoinRequestStatus.DENIED);
    });
  });

  describe("getJoinRequestsByClass", () => {
    it("throws error if teacher not part of class", async () => {
      (
        classService.isTeacherOfClass as ReturnType<typeof vi.fn>
      ).mockRejectedValue(new AccessDeniedError("Not allowed"));

      await expect(
        joinRequestService.getJoinRequestsByClass(teacherId, classId),
      ).rejects.toThrow(AccessDeniedError);
    });

    it("returns all join requests including student info", async () => {
      (
        classService.isTeacherOfClass as ReturnType<typeof vi.fn>
      ).mockResolvedValue(true);
      (
        prisma.joinRequest.findMany as ReturnType<typeof vi.fn>
      ).mockResolvedValue([
        {
          requestId: 3,
          studentId,
          classId,
          status: JoinRequestStatus.PENDING,
          student: {
            user: { firstName: "Jane", lastName: "Doe", email: "jane@doe.com" },
          },
        },
      ]);

      const result = await joinRequestService.getJoinRequestsByClass(
        teacherId,
        classId,
      );
      expect(result).toEqual([
        {
          requestId: 3,
          studentId,
          classId,
          status: JoinRequestStatus.PENDING,
          student: {
            firstName: "Jane",
            lastName: "Doe",
            email: "jane@doe.com",
          },
        },
      ]);
    });
  });
});
