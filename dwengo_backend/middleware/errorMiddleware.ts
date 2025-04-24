import { NextFunction, Request, Response } from "express";
import { AppError } from "../errors/errors";
import { logger } from "../utils/logger";

const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction,
): void => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: err.name,
      message: err.message,
    });
  } else {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode);
  }

  logger.error(
    `${req.method} ${req.originalUrl} ${res.statusCode} - ${err.message}`,
    {
      stack: err.stack,
      body: req.body,
      params: req.params,
      query: req.query,
    },
  );

  res.json({
    message: err.message,
    // Alleen de stack weergeven als je niet in productie bent:
    stack: process.env.NODE_ENV === "production" ? undefined : err.stack,
  });
};

export default errorHandler;
