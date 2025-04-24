import { Request, Response, NextFunction } from "express";
import { logger } from "../utils/logger";

/**
 * Middleware function to log the response body.
 * This will only be called if the NODE_ENV is not 'production'.
 * This will not be seen in the production environment.
 */

export const logResponseBody = () => {
  return (req: Request, res: Response, next: NextFunction) => {
    const originalJson = res.json.bind(res);

    res.json = (body) => {
      // Log the response
      logger.debug(
        `${req.method} ${req.originalUrl} ${res.statusCode} - Response: ${JSON.stringify(body)}`,
      );
      return originalJson(body);
    };

    next();
  };
};
