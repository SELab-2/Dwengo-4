import { Request, Response, NextFunction } from "express";
import { logger } from "../utils/logger";

/**
 * Middleware function to log the response body.
 * This will only be called if the NODE_ENV is not 'production'.
 * This will not be seen in the production environment.
 */

const SENSITIVE_KEYS: string[] = ["password", "token"];

/**
 * Recursively removes sensitive keys from an object.
 */
function sanitizeResponse(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(sanitizeResponse);
  } else if (obj && typeof obj === "object") {
    const sanitized: Record<string, any> = {};
    for (const key of Object.keys(obj)) {
      if (SENSITIVE_KEYS.includes(key.toLowerCase())) {
        sanitized[key] = "[REDACTED]";
      } else {
        sanitized[key] = sanitizeResponse(obj[key]);
      }
    }
    return sanitized;
  }
  return obj;
}

export const logResponseBody = () => {
  return (req: Request, res: Response, next: NextFunction) => {
    const originalJson = res.json.bind(res);

    res.json = (body) => {
      const sanitizedBody = sanitizeResponse(body);
      logger.debug(
        `${req.method} ${req.originalUrl} ${res.statusCode} - Response: ${JSON.stringify(sanitizedBody)}`,
      );
      return originalJson(body);
    };

    next();
  };
};
