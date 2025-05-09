import { describe, it, expect, beforeEach, vi } from "vitest";
import { Role, User } from "@prisma/client";
import {
  isAuthorized,
  canUpdateOrDelete,
} from "../../../services/authorizationService";
import prisma from "../../../config/prisma";

vi.mock("../../../config/prisma");

// Helper om een volledige User te mocken
const mockUser = (overrides?: Partial<User>): User => ({
  id: 1,
  firstName: "John",
  lastName: "Doe",
  email: "john@example.com",
  password: "hashed-password",
  role: Role.STUDENT,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

describe("authorizationService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("isAuthorized()", () => {
    it("should return true for ADMIN regardless of role/classId", async () => {
      (prisma.user.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockUser({ role: Role.ADMIN }),
      );
      const result = await isAuthorized(1, Role.TEACHER, 123);
      expect(result).toBe(true);
    });

    it("should return false if user has wrong role", async () => {
      (prisma.user.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockUser({ role: Role.STUDENT }),
      );
      const result = await isAuthorized(1, Role.TEACHER);
      expect(result).toBe(false);
    });

    it("should throw error if user not found", async () => {
      (prisma.user.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(
        null,
      );
      await expect(isAuthorized(1, Role.TEACHER)).rejects.toThrow(
        "User not found",
      );
    });

    it("should return true for TEACHER without class check", async () => {
      (prisma.user.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockUser({ role: Role.TEACHER }),
      );
      const result = await isAuthorized(2, Role.TEACHER);
      expect(result).toBe(true);
    });

    it("should return false if TEACHER not linked to classId", async () => {
      (prisma.user.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockUser({ role: Role.TEACHER }),
      );
      (
        prisma.classTeacher.findFirst as ReturnType<typeof vi.fn>
      ).mockResolvedValue(null);
      const result = await isAuthorized(3, Role.TEACHER, 99);
      expect(result).toBe(false);
    });

    it("should return true if TEACHER linked to classId", async () => {
      (prisma.user.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockUser({ role: Role.TEACHER }),
      );
      (
        prisma.classTeacher.findFirst as ReturnType<typeof vi.fn>
      ).mockResolvedValue({ id: 1 });
      const result = await isAuthorized(3, Role.TEACHER, 99);
      expect(result).toBe(true);
    });

    it("should return false if STUDENT not enrolled in classId", async () => {
      (prisma.user.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockUser({ role: Role.STUDENT }),
      );
      (
        prisma.classStudent.findFirst as ReturnType<typeof vi.fn>
      ).mockResolvedValue(null);
      const result = await isAuthorized(4, Role.STUDENT, 321);
      expect(result).toBe(false);
    });

    it("should return true if STUDENT is enrolled in classId", async () => {
      (prisma.user.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockUser({ role: Role.STUDENT }),
      );
      (
        prisma.classStudent.findFirst as ReturnType<typeof vi.fn>
      ).mockResolvedValue({ id: 10 });
      const result = await isAuthorized(4, Role.STUDENT, 321);
      expect(result).toBe(true);
    });
  });

  describe("canUpdateOrDelete()", () => {
    it("should return false if user is not TEACHER", async () => {
      (prisma.user.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockUser({ role: Role.STUDENT }),
      );
      const result = await canUpdateOrDelete(5, 100);
      expect(result).toBe(false);
    });

    it("should return false if no assignments found for teacher’s classes", async () => {
      (prisma.user.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockUser({ role: Role.TEACHER }),
      );
      (
        prisma.classTeacher.findMany as ReturnType<typeof vi.fn>
      ).mockResolvedValue([{ classId: 1 }]);
      (
        prisma.classAssignment.findFirst as ReturnType<typeof vi.fn>
      ).mockResolvedValue(null);
      const result = await canUpdateOrDelete(6, 100);
      expect(result).toBe(false);
    });

    it("should return true if assignment is linked to teacher’s class", async () => {
      (prisma.user.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockUser({ role: Role.TEACHER }),
      );
      (
        prisma.classTeacher.findMany as ReturnType<typeof vi.fn>
      ).mockResolvedValue([{ classId: 1 }, { classId: 2 }]);
      (
        prisma.classAssignment.findFirst as ReturnType<typeof vi.fn>
      ).mockResolvedValue({
        assignmentId: 100,
      });
      const result = await canUpdateOrDelete(7, 100);
      expect(result).toBe(true);
    });
  });
});
