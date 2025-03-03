import asyncHandler from 'express-async-handler';
import { Response } from 'express';
import { AuthenticatedRequest } from "../../middleware/teacherAuthMiddleware"
import classService from "../../services/classService";

const APP_URL = process.env.APP_URL || "http://localhost:5000";

export const createClassroom = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { name } = req.body;
  const teacherId = req.user?.id; // req.user wordt verondersteld door een auth-middleware

  if (!name) {
    res.status(400);
    throw new Error("Vul een klasnaam in");
  }

  if (!teacherId) {
    res.status(400);
    throw new Error("Geen toegang");
  }

  const classroom = classService.createClass(name, teacherId);
  res.status(201).json({ message: "Klas aangemaakt", classroom });
});

export const deleteClassroom = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { classId } = req.params;
  const teacherId = req.user?.id;

  if (!teacherId) {
    res.status(400);
    throw new Error("Geen toegang");
  }

  await classService.deleteClass(Number(classId), Number(teacherId));
  res.json({ message: "Klas verwijderd" });
});

export const getJoinLink = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { classId } = req.params;
  const teacherId = req.user?.id;

  if (!teacherId) {
    res.status(400);
    throw new Error("Geen toegang");
  }

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
  const teacherId = req.user?.id;

  if (!teacherId) {
    res.status(400);
    throw new Error("Geen toegang");
  }

  try {
    const newJoinCode = await classService.regenerateJoinCode(Number(classId), teacherId);
    const joinLink = `${APP_URL}/student/classes/join?joinCode=${newJoinCode}`;
    res.json({ joinLink });
  } catch (error) {
    res.status(403);
    throw new Error("Failed to regenerate joinLink");
  }
});


export const getClassroomStudents = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { classId } = req.params;
  const teacherId = req.user?.id;

  if (!teacherId) {
    res.status(400);
    throw new Error("Geen toegang");
  }

  const students = await classService.getStudentsByClass(Number(classId), Number(teacherId));

  if (!students) {
    res.status(403);
    throw new Error("Toegang geweigerd");
  }

  res.json({ students: students });
});
