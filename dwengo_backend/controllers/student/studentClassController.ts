import { Request, Response } from 'express';

const asyncHandler = require("express-async-handler");
import classService from "../../services/classService";

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
  const classroom = await classService.getClassByJoinCode(joinCode);
  if (!classroom) {
    res.status(404);
    throw new Error("Klas niet gevonden");
  }

  // Check if the student is already in the class
  if (await classService.isStudentInClass(classroom, studentId)) {
    res.status(400);
    throw new Error("Je bent al lid van deze klas");
  }

  // Add the student to the class using the service
  await classService.addStudentToClass(classroom.id, studentId);

  res.json({ message: "Succesvol toegetreden tot de klas" });
});
