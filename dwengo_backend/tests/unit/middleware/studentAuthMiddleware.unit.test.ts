import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { protectStudent } from "../../../middleware/studentAuthMiddleware";
// gebruik de gemockte prisma
import { Request, Response, NextFunction } from "express";

vi.mock("../../../config/prisma");

const getMockRes = () => {
  const json = vi.fn();
  const status = vi.fn(() => ({ json }));
  return { status, json } as unknown as Response;
};

const getMockNext = () => vi.fn() as NextFunction;

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

  it("geeft 401 als Authorization ontbreekt", async () => {
    const req = { headers: {} } as unknown as Request;
    const res = getMockRes();
    const next = getMockNext();

    await protectStudent(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.status(401).json).toHaveBeenCalledWith({
      error: "Geen token, niet geautoriseerd.",
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("geeft 401 als Authorization geen Bearer bevat", async () => {
    const req = {
      headers: { authorization: "Basic xyz" },
    } as unknown as Request;
    const res = getMockRes();
    const next = getMockNext();

    await protectStudent(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.status(401).json).toHaveBeenCalledWith({
      error: "Geen token, niet geautoriseerd.",
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("JWT_SECRET ontbreekt in env", async () => {
    delete process.env.JWT_SECRET;

    const req = {
      headers: { authorization: `Bearer ${token}` },
    } as unknown as Request;
    const res = getMockRes();
    const next = getMockNext();

    await protectStudent(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.status(401).json).toHaveBeenCalledWith({
      error: "Niet geautoriseerd, token mislukt.",
    });
    expect(next).not.toHaveBeenCalled();
  });
});
