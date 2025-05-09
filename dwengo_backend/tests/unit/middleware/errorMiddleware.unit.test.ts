import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import errorHandler from "../../../middleware/errorMiddleware";
import { AppError } from "../../../errors/errors";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

vi.mock("../../../config/prisma");

const mockReq = {} as any;

let mockStatusCode = 200;
let mockStatus: any;
let mockJson: any;
let mockRes: any;

beforeEach(() => {
  mockJson = vi.fn();
  mockStatus = vi.fn().mockImplementation((code: number) => {
    mockStatusCode = code;
    return { json: mockJson };
  });

  mockRes = {
    statusCode: mockStatusCode,
    status: mockStatus,
    json: mockJson,
  };
});

afterEach(() => {
  vi.clearAllMocks();
  mockStatusCode = 200;
});

// ========== 1. AppError ==========
describe("errorHandler – AppError", () => {
  it("should respond with AppError status and message", () => {
    const err = new AppError("Forbidden", 403);

    errorHandler(err, mockReq, mockRes, vi.fn());

    expect(mockStatus).toHaveBeenCalledWith(403);
    expect(mockJson).toHaveBeenCalledWith({
      error: "AppError",
      message: "Forbidden",
    });
  });
});

// ========== 2. PrismaClientKnownRequestError: P2025 ==========
describe("errorHandler – PrismaClientKnownRequestError (P2025)", () => {
  it("should return 404 when code is P2025", () => {
    const err = new PrismaClientKnownRequestError("Not found", {
      clientVersion: "4.x",
      code: "P2025",
    }) as PrismaClientKnownRequestError;

    (err.meta as any) = { target: "user" };

    errorHandler(err, mockReq, mockRes, vi.fn());

    expect(mockStatus).toHaveBeenCalledWith(404);
    expect(mockJson).toHaveBeenCalledWith({
      error: "Resource not found",
      details: { target: "user" },
    });
  });
});

// ========== 3. PrismaClientKnownRequestError: UNKNOWN CODE ==========
describe("errorHandler – PrismaClientKnownRequestError (unknown code)", () => {
  it("should return 500 with generic database error", () => {
    const err = new PrismaClientKnownRequestError("DB broke", {
      clientVersion: "4.x",
      code: "P9999",
    }) as PrismaClientKnownRequestError;

    (err.meta as any) = { query: "SELECT" };

    errorHandler(err, mockReq, mockRes, vi.fn());

    expect(mockStatus).toHaveBeenCalledWith(500);
    expect(mockJson).toHaveBeenCalledWith({
      error: "a database error occured",
      details: { query: "SELECT" },
    });
  });
});

// ========== 4. Generic Error (fallback) ==========
describe("errorHandler – Generic Error", () => {
  it("should fallback to 500 if statusCode is 200", () => {
    const err = new Error("Unexpected");

    errorHandler(err, mockReq, mockRes, vi.fn());

    expect(mockStatus).toHaveBeenCalledWith(500);
    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "Unexpected",
        stack: expect.any(String),
      }),
    );
  });

  it("should retain original statusCode if already set", () => {
    mockRes.statusCode = 418;
    const err = new Error("Teapot error");

    errorHandler(err, mockReq, mockRes, vi.fn());

    expect(mockStatus).toHaveBeenCalledWith(418);
    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "Teapot error",
      }),
    );
  });
});

// ========== 5. NODE_ENV check for stack trace ==========
describe("errorHandler – NODE_ENV behavior", () => {
  const originalEnv = process.env;

  afterEach(() => {
    process.env = originalEnv;
  });

  it("should hide stack trace in production", () => {
    process.env = { ...originalEnv, NODE_ENV: "production" };
    const err = new Error("Silent failure");

    errorHandler(err, mockReq, mockRes, vi.fn());

    const lastCall = mockJson.mock.calls.at(-1)[0];
    expect(lastCall.stack).toBeUndefined();
  });

  it("should show stack trace in development", () => {
    process.env = { ...originalEnv, NODE_ENV: "development" };
    const err = new Error("Dev failure");

    errorHandler(err, mockReq, mockRes, vi.fn());

    const lastCall = mockJson.mock.calls.at(-1)[0];
    expect(lastCall.stack).toContain("Error: Dev failure");
  });
});
