import { Response, NextFunction } from "express";
import { z, ZodIssue } from "zod";
import { AuthenticatedRequest } from "../interfaces/extendedTypeInterfaces";

const formatZodErrors = (error: z.ZodError, source: string) => {
  return error.issues.map((issue: ZodIssue) => ({
    field: issue.path.join("."),
    message: issue.message,
    source: source, // body, params or query
  }));
};

export const validationErrorMessage: string =
  "Bad request due to invalid syntax or data (validation error)";

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
  (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    const error_details: Array<{
      field: string;
      message: string;
      source: string;
    }> = [];

    if (customSchema) {
      const result = customSchema.safeParse(req);
      if (!result.success) {
        error_details.push(...formatZodErrors(result.error, "request"));
      }
    }
    if (bodySchema) {
      const bodyResult = bodySchema.safeParse(req.body);
      if (!bodyResult.success) {
        error_details.push(...formatZodErrors(bodyResult.error, "body"));
      }
    }
    if (paramsSchema) {
      const paramsResult = paramsSchema.safeParse(req.params);
      if (!paramsResult.success) {
        error_details.push(...formatZodErrors(paramsResult.error, "params"));
      }
    }
    if (querySchema) {
      const queryResult = querySchema.safeParse(req.query);
      if (!queryResult.success) {
        error_details.push(...formatZodErrors(queryResult.error, "query"));
      }
    }

    if (error_details.length > 0) {
      res.status(400).json({
        error: validationErrorMessage,
        message: customErrorMessage || "Invalid request body/params/query",
        details: error_details,
      });
      return;
    }

    next();
  };
