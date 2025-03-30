import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import { PrismaClient } from "@prisma/client";
import { Request, Response, NextFunction } from "express";
import { UnauthorizedError } from "../errors/errors";

const prisma = new PrismaClient();

interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    email: string;
  };
}

interface JwtPayload {
  id: number;
}

export const protectStudent = asyncHandler(
  async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    let token: string | undefined;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      try {
        token = req.headers.authorization.split(" ")[1];

        const decoded = jwt.verify(
          token,
          process.env.JWT_SECRET as string
        ) as JwtPayload;

        // Zoek de gebruiker (Student) en stel deze in op req.user
        const student = await prisma.student.findUnique({
          where: { userId: decoded.id }, // Finding the student by userId
          include: { user: { select: { id: true, email: true } } }, // Fetching user details
        });

        if (!student) {
          throw new UnauthorizedError("Student not found.");
        }

        req.user = { id: student.userId, email: student.user.email };
        next();
      } catch (error) {
        throw new UnauthorizedError("Malformed authorization token.");
      }
    } else {
      // No token provided
      throw new UnauthorizedError("No authorization token.");
    }
  }
);
