import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  validateRequest,
  validationErrorMessage,
} from "../../../middleware/validateRequest";
import { z } from "zod";
import { AuthenticatedRequest } from "../../../interfaces/extendedTypeInterfaces";
import { Response, NextFunction } from "express";

const getMockRes = (): Response => {
  const json = vi.fn();
  const status = vi.fn(() => ({ json }));
  return {
    status,
    json,
  } as unknown as Response;
};

const getMockNext = (): NextFunction => vi.fn();

describe("validateRequest middleware", () => {
  let next: NextFunction;
  let res: Response;

  beforeEach(() => {
    res = getMockRes();
    next = getMockNext();
  });

  it("roept next() aan bij geldige body", () => {
    const bodySchema = z.object({
      name: z.string(),
    });

    const req = {
      body: { name: "Jake" },
    } as AuthenticatedRequest;

    const middleware = validateRequest({ bodySchema });
    middleware(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  it("stuurt 400 terug bij ongeldige body", () => {
    const bodySchema = z.object({
      name: z.string(),
    });

    const req = {
      body: { name: 123 }, // fout type
    } as AuthenticatedRequest;

    const middleware = validateRequest({ bodySchema });
    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.status(400).json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: validationErrorMessage,
        message: "Invalid request body/params/query",
        details: expect.arrayContaining([
          expect.objectContaining({
            field: "name",
            message: expect.any(String),
            source: "body",
          }),
        ]),
      }),
    );
  });

  it("valideert ook params", () => {
    const paramsSchema = z.object({
      id: z.string().uuid(),
    });

    const req = {
      params: { id: "not-a-uuid" },
    } as AuthenticatedRequest;

    const middleware = validateRequest({ paramsSchema });
    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.status(400).json).toHaveBeenCalled();
  });

  it("valideert ook query", () => {
    const querySchema = z.object({
      page: z.string().regex(/^\d+$/),
    });

    const req = {
      query: { page: "abc" },
    } as AuthenticatedRequest;

    const middleware = validateRequest({ querySchema });
    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.status(400).json).toHaveBeenCalled();
  });

  it("valideert een customSchema op de volledige request", () => {
    const customSchema = z.object({
      body: z.object({
        value: z.string(),
      }),
      headers: z.object({
        authorization: z.string().startsWith("Bearer "),
      }),
    });

    const req = {
      body: { value: "ok" },
      headers: { authorization: "wrong" },
    } as AuthenticatedRequest;

    const middleware = validateRequest({ customSchema });
    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.status(400).json).toHaveBeenCalledWith(
      expect.objectContaining({
        details: expect.arrayContaining([
          expect.objectContaining({ source: "request" }),
        ]),
      }),
    );
  });

  it("combineert fouten uit verschillende schemas", () => {
    const middleware = validateRequest({
      bodySchema: z.object({ foo: z.string() }),
      querySchema: z.object({ q: z.string().uuid() }),
    });

    const req = {
      body: { foo: 123 },
      query: { q: "nope" },
    } as AuthenticatedRequest;

    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    const jsonCall = res.status(400).json as any;
    const callArgs = jsonCall.mock.calls[0][0];

    expect(callArgs.details.length).toBe(2);
    expect(callArgs.details[0].source).toBeDefined();
  });

  it("geeft custom foutmelding terug als opgegeven", () => {
    const bodySchema = z.object({
      name: z.string(),
    });

    const req = {
      body: { name: 123 },
    } as AuthenticatedRequest;

    const middleware = validateRequest({
      bodySchema,
      customErrorMessage: "Niet geldig formulier",
    });

    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.status(400).json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "Niet geldig formulier",
      }),
    );
  });

  it("roept next() aan als geen schemas zijn meegegeven", () => {
    const req = {} as AuthenticatedRequest;
    const middleware = validateRequest({});
    middleware(req, res, next);

    expect(next).toHaveBeenCalled();
  });
});
