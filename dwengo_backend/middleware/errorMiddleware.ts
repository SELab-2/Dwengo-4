import { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/errors";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/errors";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (err instanceof AppError) {
    res.status(err.statusCode);
  } else {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode);
  }

  if (err instanceof PrismaClientKnownRequestError) {
    if (err.code == "P2025") {
      res.status(404).json({ error: "Resource not found", details: err.meta });
    } else {
      // TODO: figure out how to handle other PrismaClientKnownRequestErrors (add more cases as needed)
      res
        .status(500)
        .json({ error: "a database error occured", details: err.meta });
    }
  }

  res.json({
    message: err.message,
    // Alleen de stack weergeven als je niet in productie bent:
    stack: process.env.NODE_ENV === "production" ? undefined : err.stack,
  });
};

export default errorHandler;
