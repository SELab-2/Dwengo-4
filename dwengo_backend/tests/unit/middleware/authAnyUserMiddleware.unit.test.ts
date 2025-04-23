import { describe, it, expect, vi, beforeEach } from "vitest";
import { verify } from "jsonwebtoken";
import type { AuthenticatedRequest } from "../../../interfaces/extendedTypeInterfaces";
import prisma from "../../../config/__mocks__/prisma";


vi.mock("../../../config/prisma");
vi.mock("jsonwebtoken", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    verify: vi.fn(),
  };
});

describe(" protectAnyUser Middleware (met prisma mock)", () => {
  let protectAnyUser: any;
  let req: AuthenticatedRequest;
  let res: any;
  let next: any;

  beforeEach(async () => {
    // Laad de middleware LAAT (pas NA mocks)
    protectAnyUser = (await import("../../../middleware/authAnyUserMiddleware")).protectAnyUser;

    req = { headers: {}, user: undefined } as AuthenticatedRequest;
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
    next = vi.fn();
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
    req.headers.authorization = "Bearer fake.token";
    (verify as any).mockImplementation(() => {
      throw new Error("invalid");
    });

    await protectAnyUser(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      error: "Niet geautoriseerd, token mislukt.",
    });
  });

  

  
});
