import { NextFunction, Response } from "express";
import { z, ZodIssue } from "zod";
import { AuthenticatedRequest } from "../interfaces/extendedTypeInterfaces";
import { BadRequestError } from "../errors/errors";

const formatZodErrors = (error: z.ZodError, source: string) => {
  return error.issues.map((issue: ZodIssue) => ({
    field: issue.path.join("."),
    message: issue.message,
    source: source, // body, params or query
  }));
};

type SchemaMap = {
  source: "body" | "params" | "query" | "request";
  schema?: z.ZodTypeAny;
  data?: unknown;
  assignTo?: keyof AuthenticatedRequest;
};

/**
 * use before controller to validate request body and params
 * all arguments can be undefined as not every route has a body, params, or query
 * if a schema is provided, it will be validated against the request object
 * @param customErrorMessage a custom error message for in the response
 * @param bodySchema a zod schema for the request body
 * @param paramsSchema a zod schema for the request params
 * @param querySchema a zod schema for the request query
 * @param customSchema a custom zod schema for extra functionality (wildcard)
 */
export const validateRequest =
  ({
    customErrorMessage,
    bodySchema,
    paramsSchema,
    querySchema,
    customSchema,
  }: {
    customErrorMessage?: string;
    bodySchema?: z.AnyZodObject | z.ZodOptional<z.AnyZodObject>;
    paramsSchema?: z.AnyZodObject | z.ZodOptional<z.AnyZodObject>;
    querySchema?: z.AnyZodObject | z.ZodOptional<z.AnyZodObject>;
    customSchema?: z.ZodTypeAny;
  }) =>
  (req: AuthenticatedRequest, _: Response, next: NextFunction): void => {
    const error_details: Array<{
      field: string;
      message: string;
      source: string;
    }> = [];

    const validations: SchemaMap[] = [
      { source: "request", schema: customSchema, data: req },
      { source: "body", schema: bodySchema, data: req.body, assignTo: "body" },
      {
        source: "params",
        schema: paramsSchema,
        data: req.params,
        assignTo: "params",
      },
      {        source: "query",
        schema: querySchema,
        data: req.query,
        assignTo: "query",
      },
    ];

    for (cost { sourc, schema, data, assignTo } of validations) {
      if (!schema) continue;
      const result = schema.safeParse(data);
      if (!result.success) {
        error_details.push(...formatZodErrors(result.error, source));
      } else if (assignTo) {
        (req[assignTo] as any) = result.data;
      }
    }

    if (error_details.length > 0) {
      throw new BadRequestError(
        customErrorMessage || "Invalid request body/params/query",
        error_details
      );
    }

    next();
  };
