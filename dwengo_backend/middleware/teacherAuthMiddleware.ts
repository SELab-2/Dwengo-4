import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import { PrismaClient } from '@prisma/client';
import { Response, NextFunction } from 'express';
import {AuthenticatedRequest} from "../interfaces/extendedTypeInterfaces";

const prisma = new PrismaClient();

interface JwtPayload {
  id: number;
}

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
          where: { id: decoded.id },
          select: { id: true, email: true } // Exclude password
        });

        if (!teacher) {
          res.status(401);
          throw new Error("Leerkracht niet gevonden.");
        }

        req.user = teacher;
        next();
      } catch (error) {
        console.error(error);
        res.status(401);
        throw new Error("Niet geautoriseerd, token mislukt.");
      }
    } else {
      res.status(401);
      throw new Error("Geen token, niet geautoriseerd.");
    }
  }
);
