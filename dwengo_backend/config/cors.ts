import { Request, Response, NextFunction } from "express";

const allowedOrigins: string[] = [
  "https://dwengo.org",
  "http://localhost:5173",
  "http://localhost:5000",
];

const corsMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const origin: string | undefined = req.headers.origin;
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS, PATCH",
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-Requested-With, Content-Type, Authorization",
  );
  next();
};

export default corsMiddleware;
