import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { protectStudent } from "../../../middleware/authMiddleware/studentAuthMiddleware";
import prisma from "../../../config/prisma";
import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { UnauthorizedError } from "../../../errors/errors";
import {
  invalidTokenMessage,
  noTokenProvidedMessage,
  studentNotFoundMessage,
} from "../../../middleware/authMiddleware/errorMessages";

vi.mock("../../../config/prisma");
vi.mock("jsonwebtoken");

const getMockRes = (): Response => {
  const json = vi.fn();
  const status = vi.fn(() => ({ json }));
  return { status, json } as unknown as Response;
};

const getMockNext = (): NextFunction => vi.fn() as NextFunction;

describe("protectStudent middleware", () => {
  const token = "valid.token.value";
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    vi.clearAllMocks();
    originalEnv = { ...process.env };
    process.env.JWT_SECRET = "supersecret";
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("geeft UnauthorizedError als Authorization ontbreekt", async () => {
    const req = { headers: {} } as unknown as Request;
    const res = getMockRes();
    const next = getMockNext();

    await protectStudent(req as any, res, next);

    expect(next).toHaveBeenCalledOnce();
    const err = (next as any).mock.calls[0][0];
    expect(err).toBeInstanceOf(UnauthorizedError);
    expect(err.message).toBe(noTokenProvidedMessage);
  });

  it("geeft UnauthorizedError als Authorization geen Bearer bevat", async () => {
    const req = {
      headers: { authorization: "Basic xyz" },
    } as unknown as Request;
    const res = getMockRes();
    const next = getMockNext();

    await protectStudent(req as any, res, next);

    expect(next).toHaveBeenCalledOnce();
    const err = (next as any).mock.calls[0][0];
    expect(err).toBeInstanceOf(UnauthorizedError);
    expect(err.message).toBe(noTokenProvidedMessage);
  });

  it("geeft UnauthorizedError als JWT_SECRET ontbreekt in env", async () => {
    delete process.env.JWT_SECRET;

    const req = {
      headers: { authorization: `Bearer ${token}` },
    } as unknown as Request;
    const res = getMockRes();
    const next = getMockNext();

    (jwt.verify as vi.Mock).mockReturnValue({ id: 1 });

    await protectStudent(req as any, res, next);

    expect(next).toHaveBeenCalledOnce();
    const err = (next as any).mock.calls[0][0];
    expect(err).toBeInstanceOf(UnauthorizedError);
    expect(err.message).toBe(studentNotFoundMessage);
  });

  it("geeft UnauthorizedError als student niet gevonden wordt", async () => {
    const req = {
      headers: { authorization: `Bearer ${token}` },
    } as unknown as Request;
    const res = getMockRes();
    const next = getMockNext();

    (jwt.verify as vi.Mock).mockReturnValue({ id: 2 });
    (prisma.student.findUnique as vi.Mock).mockResolvedValue(null);

    await protectStudent(req as any, res, next);

    expect(next).toHaveBeenCalledOnce();
    const err = (next as any).mock.calls[0][0];
    expect(err).toBeInstanceOf(UnauthorizedError);
    expect(err.message).toBe(studentNotFoundMessage);
  });
});
