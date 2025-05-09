import { describe, it, expect, vi, beforeEach } from "vitest";
import { isTeacher } from "../../../middleware/teacherAuthMiddleware";
import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../../../interfaces/extendedTypeInterfaces";
import prisma from "../../../config/prisma";

vi.mock("../../../config/prisma");

const createMockRes = () => {
  const res: Partial<Response> = {};
  res.status = vi.fn().mockReturnThis();
  res.json = vi.fn().mockReturnThis();
  return res as Response;
};

const mockNext: NextFunction = vi.fn();

describe("Middleware - teacherAuthMiddleware", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("isTeacher", () => {
    it("denies access if user is not a teacher", async () => {
      const req = {
        user: { id: 2 },
      } as AuthenticatedRequest;

      const res = createMockRes();

      (prisma.teacher.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(
        null,
      );

      await isTeacher(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        error: "Access denied. Only teachers can perform this action.",
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("denies access if no user ID is present", async () => {
      const req = {} as AuthenticatedRequest;
      const res = createMockRes();

      await isTeacher(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: "Unauthorized" });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("calls next() when user is a teacher", async () => {
      const req = {
        user: { id: 1 },
      } as AuthenticatedRequest;

      const res = createMockRes();

      (prisma.teacher.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(
        { userId: 1 },
      );

      await isTeacher(req, res, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });
  });
});
