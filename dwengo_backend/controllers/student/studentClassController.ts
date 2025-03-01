import { PrismaClient } from '@prisma/client';
import asyncHandler from 'express-async-handler';
import { Request, Response } from 'express';

const prisma = new PrismaClient();

// Breid het Request-type uit met een user-property
interface AuthenticatedRequest extends Request {
  user: {
    id: number;
    // Voeg hier extra properties toe indien nodig
  };
}

export const joinClassroom = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  // De join-code kan zowel als queryparameter als in de body worden meegegeven
  const joinCode = (req.query.joinCode as string) || (req.body.joinCode as string);
  const studentId = req.user.id;

  if (!joinCode) {
    res.status(400);
    throw new Error("Join code is vereist");
  }

  // Zoek de klas op basis van de join-code
  const classroom = await prisma.classroom.findUnique({ where: { joinCode } });
  if (!classroom) {
    res.status(404);
    throw new Error("Klas niet gevonden");
  }

  // Controleer of de leerling al lid is van de klas
  const alreadyJoined = await prisma.classroom.findFirst({
    where: {
      id: classroom.id,
      students: {
        some: { id: studentId }
      }
    }
  });

  if (alreadyJoined) {
    res.status(400);
    throw new Error("Je bent al lid van deze klas");
  }

  // Koppel de leerling aan de klas
  await prisma.classroom.update({
    where: { id: classroom.id },
    data: {
      students: {
        connect: { id: studentId }
      }
    }
  });

  res.json({ message: "Succesvol toegetreden tot de klas" });
});
