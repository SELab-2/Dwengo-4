import { Role, User, Teacher, Student } from "@prisma/client";
import prisma from "../../../config/prisma";
import UserService from "../../../services/userService";
import { beforeEach, describe, expect, it, vi } from "vitest";

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
    vi.clearAllMocks(); // reset alle mocks
  });

  describe("findUser", () => {
    it("should return user if found", async () => {
      (prisma.user.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(mockUser);

      const user = await UserService.findUser("test@example.com");

      expect(user).toEqual(mockUser);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { email: "test@example.com" } });
    });

    it("should return null if user not found", async () => {
      (prisma.user.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(null);

      const user = await UserService.findUser("nope@example.com");
      expect(user).toBeNull();
    });
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

      (prisma.user.create as ReturnType<typeof vi.fn>).mockResolvedValue(created);

      const result = await UserService.createUser(
        input.firstName,
        input.lastName,
        input.email,
        input.password,
        input.role
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
        })
      );
    });
  });

  describe("findUserByEmail", () => {
    it("should return user if found", async () => {
      (prisma.user.findUniqueOrThrow as ReturnType<typeof vi.fn>).mockResolvedValue(mockUser);

      const result = await UserService.findUserByEmail("test@example.com");
      expect(result).toEqual(mockUser);
    });

    it("should throw if user not found", async () => {
      (prisma.user.findUniqueOrThrow as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("Not found"));

      await expect(UserService.findUserByEmail("nope@example.com")).rejects.toThrow("Not found");
    });
  });

  describe("findTeacherUserById", () => {
    it("should return teacher with user if found", async () => {
      const teacher: Teacher & { user: User } = {
        userId: 1,
        user: mockUser,
      };

      (prisma.teacher.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(teacher);

      const result = await UserService.findTeacherUserById(1);
      expect(result).toEqual(teacher);
    });

    it("should return null if teacher not found", async () => {
      (prisma.teacher.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(null);

      const result = await UserService.findTeacherUserById(999);
      expect(result).toBeNull();
    });
  });

  describe("findStudentUserById", () => {
    it("should return student with user if found", async () => {
      const student: Student & { user: User } = {
        userId: 1,
        user: mockUser,
      };

      (prisma.student.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(student);

      const result = await UserService.findStudentUserById(1);
      expect(result).toEqual(student);
    });

    it("should return null if student not found", async () => {
      (prisma.student.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(null);

      const result = await UserService.findStudentUserById(999);
      expect(result).toBeNull();
    });
  });
});
