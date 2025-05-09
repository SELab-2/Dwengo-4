import { describe, it, expect, beforeEach, vi } from "vitest";
import { Role, User } from "@prisma/client";
import {
  isAuthorized,
  canUpdateOrDelete,
} from "../../../services/authorizationService";
import prisma from "../../../config/prisma";
import {
  AccessDeniedError,
  UnauthorizedError,
  NotFoundError,
} from "../../../errors/errors";

vi.mock("../../../config/prisma");

// Helper to build a complete User
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
    it("resolves for ADMIN regardless of role or classId", async () => {
      (prisma.user.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockUser({ role: Role.ADMIN }),
      );

      await expect(isAuthorized(1, Role.TEACHER, 123)).resolves.toBeUndefined();
    });

    it("throws UnauthorizedError if role mismatches", async () => {
      (prisma.user.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockUser({ role: Role.STUDENT }),
      );

      await expect(isAuthorized(1, Role.TEACHER)).rejects.toThrow(
        UnauthorizedError,
      );
    });

    it("throws NotFoundError if user not found", async () => {
      (prisma.user.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(
        null,
      );

      await expect(isAuthorized(1, Role.TEACHER)).rejects.toThrow(
        NotFoundError,
      );
    });

    it("resolves for TEACHER when no classId check", async () => {
      (prisma.user.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockUser({ role: Role.TEACHER }),
      );

      await expect(isAuthorized(2, Role.TEACHER)).resolves.toBeUndefined();
    });

    it("throws AccessDeniedError if TEACHER not linked to class", async () => {
      (prisma.user.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockUser({ role: Role.TEACHER }),
      );
      (
        prisma.classTeacher.findFirst as ReturnType<typeof vi.fn>
      ).mockResolvedValue(null);

      await expect(isAuthorized(3, Role.TEACHER, 99)).rejects.toThrow(
        AccessDeniedError,
      );
    });

    it("resolves if TEACHER is linked to class", async () => {
      (prisma.user.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockUser({ role: Role.TEACHER }),
      );
      (
        prisma.classTeacher.findFirst as ReturnType<typeof vi.fn>
      ).mockResolvedValue({ id: 1 });

      await expect(isAuthorized(3, Role.TEACHER, 99)).resolves.toBeUndefined();
    });

    it("throws AccessDeniedError if STUDENT not enrolled in class", async () => {
      (prisma.user.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockUser({ role: Role.STUDENT }),
      );
      (
        prisma.classStudent.findFirst as ReturnType<typeof vi.fn>
      ).mockResolvedValue(null);

      await expect(isAuthorized(4, Role.STUDENT, 321)).rejects.toThrow(
        AccessDeniedError,
      );
    });

    it("resolves if STUDENT is enrolled in class", async () => {
      (prisma.user.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockUser({ role: Role.STUDENT }),
      );
      (
        prisma.classStudent.findFirst as ReturnType<typeof vi.fn>
      ).mockResolvedValue({ id: 10 });

      await expect(isAuthorized(4, Role.STUDENT, 321)).resolves.toBeUndefined();
    });
  });

  describe("canUpdateOrDelete()", () => {
    it("throws UnauthorizedError if user is not TEACHER", async () => {
      (prisma.user.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockUser({ role: Role.STUDENT }),
      );

      await expect(canUpdateOrDelete(5, 100)).rejects.toThrow(
        UnauthorizedError,
      );
    });

    it("throws AccessDeniedError if teacher has no classes", async () => {
      (prisma.user.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockUser({ role: Role.TEACHER }),
      );
      (
        prisma.classTeacher.findMany as ReturnType<typeof vi.fn>
      ).mockResolvedValue([]);

      await expect(canUpdateOrDelete(6, 100)).rejects.toThrow(
        AccessDeniedError,
      );
    });

    it("throws NotFoundError if no assignment found for any of teacher’s classes", async () => {
      (prisma.user.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockUser({ role: Role.TEACHER }),
      );
      (
        prisma.classTeacher.findMany as ReturnType<typeof vi.fn>
      ).mockResolvedValue([{ classId: 1 }]);
      (
        prisma.classAssignment.findFirst as ReturnType<typeof vi.fn>
      ).mockResolvedValue(null);

      await expect(canUpdateOrDelete(7, 100)).rejects.toThrow(NotFoundError);
    });

    it("resolves if assignment is linked to one of teacher’s classes", async () => {
      (prisma.user.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockUser({ role: Role.TEACHER }),
      );
      (
        prisma.classTeacher.findMany as ReturnType<typeof vi.fn>
      ).mockResolvedValue([{ classId: 1 }, { classId: 2 }]);
      (
        prisma.classAssignment.findFirst as ReturnType<typeof vi.fn>
      ).mockResolvedValue({ assignmentId: 100 });

      await expect(canUpdateOrDelete(7, 100)).resolves.toBeUndefined();
    });
  });
});
