import { describe, it, expect, vi, beforeEach, afterEach, beforeAll } from "vitest";
import type { AuthenticatedRequest } from "../../../interfaces/extendedTypeInterfaces";

//! zeer moeilijk te testen deze middleware, is ook slechts deels getest

// Mock functies
const mockUserFindUnique = vi.fn();
const mockTeacherFindUnique = vi.fn();
const mockStudentFindUnique = vi.fn();

// Mock Prisma
vi.mock("@prisma/client", async () => {
  return {
    PrismaClient: vi.fn().mockImplementation(() => ({
      user: { findUnique: mockUserFindUnique },
      teacher: { findUnique: mockTeacherFindUnique },
      student: { findUnique: mockStudentFindUnique },
    })),
    Role: {
      ADMIN: "ADMIN",
      TEACHER: "TEACHER",
      STUDENT: "STUDENT",
    },
  };
});

// Mock JWT
vi.mock("jsonwebtoken", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual as any,
    verify: vi.fn(),
  };
});

import { verify } from "jsonwebtoken";

let protectAnyUser: any;

beforeAll(async () => {
  const imported = await import("../../../middleware/authAnyUserMiddleware");
  protectAnyUser = imported.protectAnyUser;
});

describe("🔐 protectAnyUser Middleware (zonder code-aanpassing)", () => {
  let req: AuthenticatedRequest;
  let res: any;
  let next: any;

  beforeEach(() => {
    req = { headers: {}, user: undefined } as AuthenticatedRequest;
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
    next = vi.fn();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("⚠️ Geen token aanwezig", async () => {
    await protectAnyUser(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      error: "Geen token, niet geautoriseerd.",
    });
  });

  it("⚠️ Ongeldige token", async () => {
    req.headers.authorization = "Bearer invalid.token";
    (verify as any).mockImplementation(() => {
      throw new Error("invalid token");
    });

    await protectAnyUser(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      error: "Niet geautoriseerd, token mislukt.",
    });
  });
});
