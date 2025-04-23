import { Response, NextFunction } from "express";
import asyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";
import { Teacher, Student, User } from "@prisma/client";
import {
  AuthenticatedRequest,
  AuthenticatedUser,
} from "../interfaces/extendedTypeInterfaces";
import prisma from "../config/prisma"; // - gebruik de gedeelde client

interface JwtPayload {
  id: number;
}

export const protectAnyUser = asyncHandler(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
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

        const user: User | null = await prisma.user.findUnique({
          where: { id: decoded.id },
        });

        if (!user) {
          res.status(401).json({ error: "Gebruiker bestaat niet." });
          return;
        }

        const authUser: AuthenticatedUser = {
          id: user.id,
          role: user.role,
          email: user.email,
        };

        if (user.role === "TEACHER") {
          const teacher: Teacher | null = await prisma.teacher.findUnique({
            where: { userId: user.id },
            include: {
              teacherFeedbacks: true,
              invite: true,
              createdLearningPaths: true,
              createdLearningObjects: true,
              teaches: true,
            },
          });
          if (teacher) {
            authUser.teacher = teacher;
          }
        } else if (user.role === "STUDENT") {
          const student: Student | null = await prisma.student.findUnique({
            where: { userId: user.id },
            include: {
              progress: true,
              joinRequests: true,
              classes: true,
            },
          });
          if (student) {
            authUser.student = student;
          }
        }

        req.user = authUser;
        next();
      } catch (error) {
        console.error(error);
        res.status(401).json({ error: "Niet geautoriseerd, token mislukt." });
      }
    } else {
      res.status(401).json({ error: "Geen token, niet geautoriseerd." });
    }
  }
);
