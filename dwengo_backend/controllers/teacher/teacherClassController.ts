import asyncHandler from 'express-async-handler';
import { Response } from 'express';
import { AuthenticatedRequest } from "../../interfaces/extendedTypeInterfaces";
import classService from "../../services/classService";
import { Student } from "@prisma/client";

const APP_URL = process.env.APP_URL || "http://localhost:5000";

export const isTeacherValid = (req: AuthenticatedRequest, res: Response): boolean => {
  const teacherId = req.user?.id;
  if (!teacherId) {
    res.status(400).json({ message: "Geen toegang" });
    return false; // Teacher is not authorized
  }
  return true; // Teacher is authorized
};


export const isNameValid = (req: AuthenticatedRequest, res: Response): boolean => {
  const { name } = req.body;
  if (!name || typeof name !== "string" || name.trim() === "") {
    res.status(400).json({ message: "Vul een geldige klasnaam in" });
    return false;
  }
  return true;
};


// Create classroom
export const createClassroom = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { name } = req.body;
  const teacherId = req.user?.id as number;

  // If invalid, response is sent, and execution stops
  if (!isTeacherValid(req, res)) return;
  if (!isNameValid(req, res)) return;

  const classroom = await classService.createClass(name, teacherId);
  res.status(201).json({ message: "Klas aangemaakt", classroom });
});

// Delete classroom
export const deleteClassroom = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { classId } = req.params;
  const teacherId = req.user?.id;

  if (!isTeacherValid(req, res)) return;

  await classService.deleteClass(Number(classId), Number(teacherId));
  res.json({ message: "Klas verwijderd" });
});

// Get join link
export const getJoinLink = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { classId } = req.params;
  const teacherId = req.user?.id as number;

  if (!isTeacherValid(req, res)) return;

  const joinCode = await classService.getJoinCode(Number(classId), teacherId);

  if (!joinCode) {
    res.status(403);
    throw new Error("Toegang geweigerd");
  }

  const joinLink = `${APP_URL}/student/classes/join?joinCode=${joinCode}`;
  res.json({ joinLink });
});

// Regenerate join link
export const regenerateJoinLink = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { classId } = req.params;
  const teacherId = req.user?.id as number;

  if (!isTeacherValid(req, res)) return;

  try {
    const newJoinCode = await classService.regenerateJoinCode(Number(classId), teacherId);
    const joinLink = `${APP_URL}/student/classes/join?joinCode=${newJoinCode}`;
    res.json({ joinLink });
  } catch (error) {
    res.status(403).json({ message: "Failed to regenerate joinLink" });
    return;
  }
});

// Get classroom students
export const getClassroomStudents = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { classId } = req.params;
  const teacherId = req.user?.id as number;

  if (!isTeacherValid(req, res)) return;

  const students: Student[] = await classService.getStudentsByClass(Number(classId), teacherId);

  if (!students) {
    res.status(403).json({ message: "Toegang geweigerd" });
    return;
  }

  res.json({ students });
});
