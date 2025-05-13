import { describe, it, expect, vi, beforeEach } from "vitest";
import { validateRequest } from "../../../middleware/validateRequest";
import { z } from "zod";
import { AuthenticatedRequest } from "../../../interfaces/extendedTypeInterfaces";
import { BadRequestError } from "../../../errors/errors";

describe("validateRequest middleware", () => {
  let next: ReturnType<typeof vi.fn>;
  const noopResponse = {} as any; // not used since we throw

  beforeEach(() => {
    next = vi.fn();
  });

  function runAndCatch(fn: () => void): any {
    try {
      fn();
    } catch (err) {
      return err;
    }
    throw new Error("Expected middleware to throw");
  }

  it("calls next() on valid body", () => {
    const bodySchema = z.object({ name: z.string() });
    const req = { body: { name: "Jake" } } as AuthenticatedRequest;

    const middleware = validateRequest({ bodySchema });
    middleware(req, noopResponse, next);

    expect(next).toHaveBeenCalled();
  });

  it("throws BadRequestError on invalid body", () => {
    const bodySchema = z.object({ name: z.string() });
    const req = { body: { name: 123 } } as AuthenticatedRequest;

    const middleware = validateRequest({ bodySchema });
    const err = runAndCatch(() => middleware(req, noopResponse, next));

    expect(err).toBeInstanceOf(BadRequestError);
    // no assertion on message here, since BadRequestError.message is the default
    expect(Array.isArray(err.details)).toBe(true);
    expect(err.details).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          field: "name",
          source: "body",
          message: expect.any(String),
        }),
      ]),
    );
  });

  it("throws on invalid params", () => {
    const paramsSchema = z.object({ id: z.string().uuid() });
    const req = { params: { id: "not-a-uuid" } } as AuthenticatedRequest;

    const middleware = validateRequest({ paramsSchema });
    const err = runAndCatch(() => middleware(req, noopResponse, next));

    expect(err).toBeInstanceOf(BadRequestError);
    expect(err.details[0].source).toBe("params");
  });

  it("throws on invalid query", () => {
    const querySchema = z.object({ page: z.string().regex(/^\d+$/) });
    const req = { query: { page: "abc" } } as AuthenticatedRequest;

    const middleware = validateRequest({ querySchema });
    const err = runAndCatch(() => middleware(req, noopResponse, next));

    expect(err).toBeInstanceOf(BadRequestError);
    expect(err.details[0].source).toBe("query");
  });

  it("validates customSchema against entire request", () => {
    const customSchema = z.object({
      body: z.object({ value: z.string() }),
      headers: z.object({ authorization: z.string().startsWith("Bearer ") }),
    });
    const req = {
      body: { value: "ok" },
      headers: { authorization: "wrong" },
    } as AuthenticatedRequest;

    const middleware = validateRequest({ customSchema });
    const err = runAndCatch(() => middleware(req, noopResponse, next));

    expect(err).toBeInstanceOf(BadRequestError);
    expect(err.details).toEqual(
      expect.arrayContaining([expect.objectContaining({ source: "request" })]),
    );
  });

  it("combines errors from multiple schemas", () => {
    const middleware = validateRequest({
      bodySchema: z.object({ foo: z.string() }),
      querySchema: z.object({ q: z.string().uuid() }),
    });
    const req = {
      body: { foo: 123 },
      query: { q: "nope" },
    } as AuthenticatedRequest;

    const err = runAndCatch(() => middleware(req, noopResponse, next));
    expect(err).toBeInstanceOf(BadRequestError);
    expect(err.details).toHaveLength(2);
    expect(err.details.map((d: any) => d.source)).toEqual(
      expect.arrayContaining(["body", "query"]),
    );
  });

  it("honors a customErrorMessage when provided", () => {
    const bodySchema = z.object({ name: z.string() });
    const req = { body: { name: 123 } } as AuthenticatedRequest;

    const middleware = validateRequest({
      bodySchema,
      customErrorMessage: "Niet geldig formulier",
    });
    const err = runAndCatch(() => middleware(req, noopResponse, next));

    expect(err).toBeInstanceOf(BadRequestError);
    expect(err.message).toBe("Niet geldig formulier");
  });

  it("calls next() when no schemas given", () => {
    const req = {} as AuthenticatedRequest;
    const middleware = validateRequest({});
    middleware(req, noopResponse, next);
    expect(next).toHaveBeenCalled();
  });
});
