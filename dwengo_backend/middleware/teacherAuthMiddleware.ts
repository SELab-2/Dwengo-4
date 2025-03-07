import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import { PrismaClient } from '@prisma/client';
import { Response, NextFunction } from 'express';
import {AuthenticatedRequest} from "../interfaces/extendedTypeInterfaces";

const prisma = new PrismaClient();

interface JwtPayload {
  id: number;
}

export const isTeacher = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  const userId = req.user?.id;
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return; // Ensure the function exits after sending a response
  }

  const teacher = await prisma.teacher.findUnique({ where: { userId } });
  if (!teacher) {
    res.status(403).json({ error: "Access denied. Only teachers can perform this action." });
    return; // Prevent next() from running
  }

  next(); // Ensure next() is only called when valid
};

export const protectTeacher = asyncHandler(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    let token: string | undefined;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      try {
        token = req.headers.authorization.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;

        // Zoek de gebruiker (Teacher) en stel deze in op req.user
        const teacher = await prisma.teacher.findUnique({
          where: { userId: decoded.id },
          include: { user: { select: { id: true, email: true } } } // Exclude password
        });

        if (!teacher) {
          // Directly return the error response instead of throwing
          res.status(401).json({ error: "Leerkracht niet gevonden." });
          return;
        }

        req.user = { id: teacher.userId, email: teacher.user.email };
        next();
      } catch (error) {
        console.error(error);
        // Return the error response directly
        res.status(401).json({ error: "Niet geautoriseerd, token mislukt." });
        return;
      }
    } else {
      // Return the error response directly
      res.status(401).json({ error: "Geen token, niet geautoriseerd." });
      return;
    }
  }
);
