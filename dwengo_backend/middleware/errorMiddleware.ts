import { Request, Response } from "express";
import { AppError } from "../errors/errors";

const errorHandler = (err: Error, req: Request, res: Response): void => {
  if (err instanceof AppError) {
    res.status(err.statusCode);
  } else {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode);
  }

  res.json({
    message: err.message,
    // Alleen de stack weergeven als je niet in productie bent:
    stack: process.env.NODE_ENV === "production" ? undefined : err.stack,
  });
};

export default errorHandler;
