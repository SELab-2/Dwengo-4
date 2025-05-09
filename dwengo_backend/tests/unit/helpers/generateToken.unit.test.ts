import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { generateToken } from "../../../helpers/generateToken";
import jwt from "jsonwebtoken";

describe("generateToken", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv, JWT_SECRET: "supertestsecret" };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("genereert een geldig JWT-token met id als payload", () => {
    const id = 42;
    const token = generateToken(id);

    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    expect(decoded).toHaveProperty("id", id);
  });

  it("genereert unieke tokens bij verschillende ids", () => {
    const token1 = generateToken(1);
    const token2 = generateToken(2);

    expect(token1).not.toBe(token2);
  });

  it("gooit een error als JWT_SECRET ontbreekt", () => {
    delete process.env.JWT_SECRET;

    expect(() => generateToken(123)).toThrowError(
      "JWT_SECRET is niet gedefinieerd in de omgevingsvariabelen",
    );
  });

  it("genereert tokens die vervallen binnen 7 dagen", () => {
    const id = 999;
    const token = generateToken(id);

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET!,
    ) as jwt.JwtPayload;
    const now = Math.floor(Date.now() / 1000);

    expect(decoded.exp).toBeGreaterThan(now);
    expect(decoded.exp).toBeLessThan(now + 60 * 60 * 24 * 7 + 10); // max 7 dagen + 10s speling
  });
});
