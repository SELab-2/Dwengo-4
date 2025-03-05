import { Request, Response, NextFunction } from "express";
import asyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface JwtPayload {
  id: number;
}

interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    role: string;
  };
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

        const user = await prisma.user.findUnique({ where: { id: decoded.id } });
        if (!user) {
          res.status(401).json({ error: "Gebruiker niet gevonden." });
          return;
        }
        req.user = { id: user.id, role: user.role };
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
