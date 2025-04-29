import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import { PrismaClient } from "@prisma/client";
import { NextFunction, Response } from "express";
import { AuthenticatedRequest } from "../../interfaces/extendedTypeInterfaces";
import { AppError, UnauthorizedError } from "../../errors/errors";
import {
  invalidTokenMessage,
  noTokenProvidedMessage,
  teacherNotFoundMessage,
} from "./errorMessages";

const prisma = new PrismaClient();

interface JwtPayload {
  id: number;
}

/*export const isTeacher = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const userId = getUserFromAuthRequest(req).id;

  const teacher = await prisma.teacher.findUnique({ where: { userId } });
  if (!teacher) {
    throw new UnauthorizedError(teacherNotFoundMessage);
  }

  next(); // Ensure next() is only called when valid
};*/

export const protectTeacher = asyncHandler(
  async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
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
          process.env.JWT_SECRET as string,
        ) as JwtPayload;

        // Zoek de gebruiker (Teacher) en stel deze in op req.user
        const teacher = await prisma.teacher.findUnique({
          where: { userId: decoded.id },
          include: { user: { select: { id: true, email: true } } }, // Exclude password
        });

        if (!teacher) {
          throw new UnauthorizedError(teacherNotFoundMessage);
        }

        req.user = {
          id: teacher.userId,
          email: teacher.user.email,
          role: "TEACHER",
        };
        next();
      } catch (error) {
        if (!(error instanceof AppError)) {
          throw new UnauthorizedError(invalidTokenMessage);
        }
        throw error; // Re-throw the error if it's an AppError
      }
    } else {
      throw new UnauthorizedError(noTokenProvidedMessage);
    }
  },
);

export { AuthenticatedRequest };
