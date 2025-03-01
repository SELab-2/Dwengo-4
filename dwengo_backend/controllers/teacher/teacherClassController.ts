import { PrismaClient } from '@prisma/client';
import asyncHandler from 'express-async-handler';
import crypto from 'crypto';
import { Request, Response } from 'express';
const asyncHandler = require("express-async-handler");
import * as classService from "../../services/classService";

const APP_URL = process.env.APP_URL || "http://localhost:5000";

// Uitbreiding van het Express Request-type zodat we een user-property hebben
interface AuthenticatedRequest extends Request {
  user: {
    id: number | string;
    // Eventueel extra properties toevoegen indien nodig
  };
}

export const createClassroom = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { name } = req.body;
  const teacherId = req.user.id; // req.user wordt verondersteld door een auth-middleware

  if (!name) {
    res.status(400);
    throw new Error("Vul een klasnaam in");
  }

  const classroom = createClassroom(name, teacherId);
  res.status(201).json({ message: "Klas aangemaakt", classroom });
});

export const deleteClassroom = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { classId } = req.params;
  const teacherId = req.user.id;

  await classService.deleteClass(Number(classId), Number(teacherId));
  res.json({ message: "Klas verwijderd" });
});

export const getJoinLink = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { classId } = req.params;
  const teacherId = req.user.id;

  const joinCode = await classService.getJoinCode(Number(classId), Number(teacherId));

  if (!joinCode) {
    res.status(403);
    throw new Error("Toegang geweigerd");
  }

  // Bouw de join-link op (bijv. http://localhost:5000/student/classes/join?joinCode=xxx)
  const joinLink = `${APP_URL}/student/classes/join?joinCode=${joinCode}`;
  res.json({ joinLink });
});

// Vernieuw (regenerate) de join-link (join-code)
export const regenerateJoinLink = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { classId } = req.params;
  const teacherId = req.user.id;

  try {
    const newJoinCode = await classService.regenerateJoinCode(Number(classId), teacherId);
    const joinLink = `${APP_URL}/student/classes/join?joinCode=${newJoinCode}`;
    res.json({ joinLink });
  } catch (error) {
    res.status(403);
    throw new Error(error.message);
  }
});


export const getClassroomStudents = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { classId } = req.params;
  const teacherId = req.user.id;

  const students = await classService.getStudentsByClass(Number(classId), Number(teacherId));

  if (!students) {
    res.status(403);
    throw new Error("Toegang geweigerd");
  }

  res.json({ students: students });
});
