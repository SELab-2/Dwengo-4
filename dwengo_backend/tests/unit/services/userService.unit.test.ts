import { Role, User, Teacher, Student } from "@prisma/client";
import prisma from "../../../config/prisma";
import UserService from "../../../services/userService";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { NotFoundError } from "../../../errors/errors";

vi.mock("../../../config/prisma");

describe("UserService", () => {
  const mockUser: User = {
    id: 1,
    firstName: "Test",
    lastName: "User",
    email: "test@example.com",
    password: "hashedpw",
    role: Role.STUDENT,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createUser", () => {
    it("should create a student user", async () => {
      const input = {
        firstName: "S",
        lastName: "T",
        email: "s@test.com",
        password: "pass",
        role: Role.STUDENT,
      };
      const created = {
        ...mockUser,
        ...input,
        student: {},
        teacher: null,
        admin: null,
      };

      (prisma.user.create as ReturnType<typeof vi.fn>).mockResolvedValue(
        created,
      );

      const result = await UserService.createUser(
        input.firstName,
        input.lastName,
        input.email,
        input.password,
        input.role,
      );

      expect(result).toEqual(created);
      expect(prisma.user.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            student: { create: {} },
            teacher: undefined,
            admin: undefined,
          }),
          include: { teacher: true, student: true, admin: true },
        }),
      );
    });
  });

  describe("findUserByEmail", () => {
    it("should return user if found", async () => {
      (prisma.user.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockUser,
      );

      const result = await UserService.findUserByEmail("test@example.com");

      expect(result).toEqual(mockUser);
      expect(prisma.user.findFirst).toHaveBeenCalledWith({
        where: { email: "test@example.com" },
      });
    });

    it("should throw NotFoundError if user not found", async () => {
      (prisma.user.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(
        null,
      );

      await expect(
        UserService.findUserByEmail("nope@example.com"),
      ).rejects.toThrow(NotFoundError);

      await expect(
        UserService.findUserByEmail("nope@example.com"),
      ).rejects.toThrow("Existing user not found.");
    });
  });

  describe("findTeacherUserById", () => {
    it("should return teacher with user if found", async () => {
      const teacher: Teacher & { user: User } = {
        userId: 1,
        user: mockUser,
      };

      (prisma.teacher.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(
        teacher,
      );

      const result = await UserService.findTeacherUserById(1);

      expect(result).toEqual(teacher);
      expect(prisma.teacher.findUnique).toHaveBeenCalledWith({
        where: { userId: 1 },
        include: { user: true },
      });
    });

    it("should throw NotFoundError if teacher not found", async () => {
      (prisma.teacher.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(
        null,
      );

      await expect(UserService.findTeacherUserById(999)).rejects.toThrow(
        NotFoundError,
      );
      await expect(UserService.findTeacherUserById(999)).rejects.toThrow(
        "Teacher not found.",
      );
    });
  });

  describe("findStudentUserById", () => {
    it("should return student with user if found", async () => {
      const student: Student & { user: User } = {
        userId: 1,
        user: mockUser,
      };

      (prisma.student.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(
        student,
      );

      const result = await UserService.findStudentUserById(1);

      expect(result).toEqual(student);
      expect(prisma.student.findUnique).toHaveBeenCalledWith({
        where: { userId: 1 },
        include: { user: true },
      });
    });

    it("should throw NotFoundError if student not found", async () => {
      (prisma.student.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(
        null,
      );

      await expect(UserService.findStudentUserById(999)).rejects.toThrow(
        NotFoundError,
      );
      await expect(UserService.findStudentUserById(999)).rejects.toThrow(
        "Student not found.",
      );
    });
  });
});
