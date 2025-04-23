import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from "../interfaces/extendedTypeInterfaces";
import prisma from '../config/prisma';

interface JwtPayload {
  id: number;
}

export const isTeacher = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const userId = req.user?.id;
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const teacher = await prisma.teacher.findUnique({ where: { userId } });
  if (!teacher) {
    res.status(403).json({ error: "Access denied. Only teachers can perform this action." });
    return;
  }

  next();
};

export const protectTeacher = asyncHandler(
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
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;

        const teacher = await prisma.teacher.findUnique({
          where: { userId: decoded.id },
          include: { user: { select: { id: true, email: true } } }
        });

        if (!teacher) {
          res.status(401).json({ error: "Leerkracht niet gevonden." });
          return;
        }

        req.user = { id: teacher.userId, email: teacher.user.email, role: 'TEACHER' };
        next();
      } catch (error) {
        console.error(error);
        res.status(401).json({ error: "Niet geautoriseerd, token mislukt." });
        return;
      }
    } else {
      res.status(401).json({ error: "Geen token, niet geautoriseerd." });
      return;
    }
  }
);
