import { Request, Response, NextFunction } from "express";
import asyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface JwtPayload {
  id: number;
}

export const protectAnyUser = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
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

        // Zoek de user in de DB
        const user = await prisma.user.findUnique({ where: { id: decoded.id } });
        if (!user) {
          res.status(401);
          throw new Error("Gebruiker niet gevonden.");
        }

        // Zet user op req, zodat je in de controller z’n role kunt checken
        (req as any).user = {
          id: user.id,
          role: user.role,
        };

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
