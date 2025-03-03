import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import { PrismaClient } from '@prisma/client';
import { Request, Response, NextFunction } from 'express';

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

        // Zoek de gebruiker (Student) en stel deze in op req.user
        const student = await prisma.student.findUnique({
          where: { userId: decoded.id },  // Finding the student by userId
          include: { user: { select: { id: true, email: true } } } // Fetching user details
        });

        if (!student) {
          res.status(401).json({ error: "Student niet gevonden." });
          return; // Ensure no further execution after sending the response
        }

        req.user = { id: student.userId, email: student.user.email };
        next();
      } catch (error) {
        console.error(error);
        res.status(401).json({ error: "Niet geautoriseerd, token mislukt." });
        return; // Ensure no further execution after sending the response
      }
    } else {
      res.status(401).json({ error: "Geen token, niet geautoriseerd." });
      return; // Ensure no further execution after sending the response
    }
  }
);
