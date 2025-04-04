import { Response, NextFunction } from "express";
import asyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";
import { PrismaClient, Teacher, Student, User } from "@prisma/client";
import {
  AuthenticatedRequest,
  AuthenticatedUser,
} from "../../interfaces/extendedTypeInterfaces";
import { UnauthorizedError } from "../../errors/errors";
import {
  invalidTokenMessage,
  neitherTeacherNorStudentMessage,
  noTokenProvidedMessage,
  userNotFoundMessage,
} from "./errorMessages";
const prisma = new PrismaClient();

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
          process.env.JWT_SECRET as string,
        ) as JwtPayload;

        // Zoek de gebruiker in de database
        const user: User | null = await prisma.user.findUnique({
          where: { id: decoded.id },
        });
        if (!user) {
          throw new UnauthorizedError(userNotFoundMessage);
        }

        // Bouw het authUser object op met basisgegevens
        const authUser: AuthenticatedUser = {
          id: user.id,
          role: user.role,
          email: user.email,
        };

        // Als de gebruiker een teacher is, haal dan de teacher-specifieke data op
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
        }
        // Als de gebruiker een student is, haal dan de student-specifieke data op
        else if (user.role === "STUDENT") {
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

        if (!req.user?.teacher && !req.user?.student) {
          // Make sure that user is either a teacher or a student
          throw new UnauthorizedError(neitherTeacherNorStudentMessage);
        }

        req.user = authUser;
        next();
      } catch {
        throw new UnauthorizedError(invalidTokenMessage);
      }
    } else {
      throw new UnauthorizedError(noTokenProvidedMessage);
    }
  },
);
