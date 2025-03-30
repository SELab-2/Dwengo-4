import { Response, NextFunction } from "express";
import { z } from "zod";
import { AuthenticatedRequest } from "./authMiddleware/teacherAuthMiddleware";

const formatZodErrors = (error: z.ZodError, source: string) => {
  return error.issues.map((issue) => ({
    field: issue.path.join("."),
    message: issue.message,
    source: source, // body, params or query
  }));
};

/**
 * use before controller to validate request body and params
 * all arguments can be undefined as not every route has a body, params, or query
 * if a schema is provided, it will be validated against the request object
 * @param customErrorMessage a custom error message for in the response
 * @param bodySchema a zod schema for the request body
 * @param paramsSchema a zod schema for the request params
 * @param querySchema a zod schema for the request query
 */
export const validateRequest =
  (
    customErrorMessage?: string,
    bodySchema?: z.AnyZodObject | z.ZodOptional<z.AnyZodObject>,
    paramsSchema?: z.AnyZodObject | z.ZodOptional<z.AnyZodObject>,
    querySchema?: z.AnyZodObject | z.ZodOptional<z.AnyZodObject>,
  ) =>
  (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const error_details: Array<{
      field: string;
      message: string;
      source: string;
    }> = [];
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
        error: "validation error",
        message: customErrorMessage || "invalid request body/params/query",
        details: error_details,
      });
      return;
    }

    next();
  };
