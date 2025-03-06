import { Request, Response, NextFunction } from "express";
import asyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";
import { PrismaClient, Role, Teacher, Student, User } from "@prisma/client";

const prisma = new PrismaClient();

interface JwtPayload {
  id: number;
}

// Definieer een interface voor de geauthenticeerde gebruiker,
// met optionele velden voor teacher en student
interface AuthenticatedUser {
  id: number;
  role: Role;
  teacher?: Teacher;
  student?: Student;
}

// Breid het Express Request-type uit zodat we een getypeerde user-property hebben
interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
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
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;

        // Zoek de gebruiker in de database
        const user: User | null = await prisma.user.findUnique({ where: { id: decoded.id } });
        if (!user) {
          res.status(401).json({ error: "Gebruiker niet gevonden." });
          return;
        }

        // Bouw het authUser object op met basisgegevens
        const authUser: AuthenticatedUser = { id: user.id, role: user.role };

        // Als de gebruiker een teacher is, haal dan de teacher-specifieke data op
        if (user.role === "TEACHER") {
          const teacher: Teacher | null = await prisma.teacher.findUnique({
            where: { userId: user.id },
            include: {
              teacherAnswers: true,
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
              studentQuestions: true,
              progress: true,
              teamAssignments: true,
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

