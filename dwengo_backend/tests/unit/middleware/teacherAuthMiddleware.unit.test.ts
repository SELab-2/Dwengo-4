import { describe, it, expect, vi, beforeEach } from "vitest";
import { protectTeacher } from "../../../middleware/authMiddleware/teacherAuthMiddleware";
import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../../../interfaces/extendedTypeInterfaces";
import prisma from "../../../config/prisma";
import jwt from "jsonwebtoken";
import { UnauthorizedError } from "../../../errors/errors";
import {
  invalidTokenMessage,
  noTokenProvidedMessage,
  teacherNotFoundMessage,
} from "../../../middleware/authMiddleware/errorMessages";

vi.mock("../../../config/prisma");
vi.mock("jsonwebtoken");

const createMockRes = () => {
  const res: Partial<Response> = {};
  res.status = vi.fn().mockReturnThis();
  res.json = vi.fn().mockReturnThis();
  return res as Response;
};

describe("Middleware - protectTeacher", () => {
  let mockNext: NextFunction;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.JWT_SECRET = "test-secret";
    mockNext = vi.fn();
  });

  it("denies access if no Authorization header", async () => {
    const req = { headers: {} } as AuthenticatedRequest;
    const res = createMockRes();

    await protectTeacher(req, res, mockNext);

    expect(mockNext).toHaveBeenCalledOnce();
    const err = (mockNext as any).mock.calls[0][0];
    expect(err).toBeInstanceOf(UnauthorizedError);
    expect(err.message).toBe(noTokenProvidedMessage);
  });

  it("denies access if token is invalid", async () => {
    const req = {
      headers: { authorization: "Bearer badtoken" },
    } as AuthenticatedRequest;
    const res = createMockRes();

    (jwt.verify as vi.Mock).mockImplementation(() => {
      throw new Error("jwt fail");
    });

    await protectTeacher(req, res, mockNext);

    expect(mockNext).toHaveBeenCalledOnce();
    const err = (mockNext as any).mock.calls[0][0];
    expect(err).toBeInstanceOf(UnauthorizedError);
    expect(err.message).toBe(invalidTokenMessage);
  });

  it("denies access if no teacher record for user", async () => {
    const req = {
      headers: { authorization: "Bearer validtoken" },
    } as AuthenticatedRequest;
    const res = createMockRes();

    (jwt.verify as vi.Mock).mockReturnValue({ id: 42 });
    (prisma.teacher.findUnique as vi.Mock).mockResolvedValue(null);

    await protectTeacher(req, res, mockNext);

    expect(mockNext).toHaveBeenCalledOnce();
    const err = (mockNext as any).mock.calls[0][0];
    expect(err).toBeInstanceOf(UnauthorizedError);
    expect(err.message).toBe(teacherNotFoundMessage);
  });
});
