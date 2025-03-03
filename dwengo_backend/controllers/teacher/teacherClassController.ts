import asyncHandler from 'express-async-handler';
import {NextFunction, Response} from 'express';
import { AuthenticatedRequest } from "../../middleware/teacherAuthMiddleware"
import classService from "../../services/classService";
import {Student} from "@prisma/client";

const APP_URL = process.env.APP_URL || "http://localhost:5000";

export const checkTeacher = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const teacherId = req.user?.id

  if (!teacherId) {
    return res.status(400).json({ message: "Geen toegang" });
  }

  next();
};

export const checkName = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const { name } = req.body;

  if (!name || typeof name !== "string" || name.trim() === "") {
    return res.status(400).json({ message: "Vul een geldige klasnaam in" });
  }

  next();
};

export const createClassroom = [
    checkTeacher,
    checkName,
    asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
      const { name } = req.body;
      const teacherId = req.user?.id as number; // req.user wordt verondersteld door een auth-middleware

      const classroom = await classService.createClass(name, teacherId);
      res.status(201).json({ message: "Klas aangemaakt", classroom });
    }),
];

export const deleteClassroom = [
    checkTeacher,
    asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
      const { classId } = req.params;
      const teacherId = req.user?.id;

      await classService.deleteClass(Number(classId), Number(teacherId));
      res.json({ message: "Klas verwijderd" });
    }),
];

export const getJoinLink = [
    checkTeacher,
    asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
      const { classId } = req.params;
      const teacherId = req.user?.id as number;

      const joinCode = await classService.getJoinCode(Number(classId), teacherId);

      if (!joinCode) {
        res.status(403);
        throw new Error("Toegang geweigerd");
      }

      // Bouw de join-link op (bijv. http://localhost:5000/student/classes/join?joinCode=xxx)
      const joinLink = `${APP_URL}/student/classes/join?joinCode=${joinCode}`;
      res.json({ joinLink });
    }),
];

// Vernieuw (regenerate) de join-link (join-code)
export const regenerateJoinLink = [
    checkTeacher,
    asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
      const { classId } = req.params;
      const teacherId = req.user?.id as number;

      try {
        const newJoinCode = await classService.regenerateJoinCode(Number(classId), teacherId);
        const joinLink = `${APP_URL}/student/classes/join?joinCode=${newJoinCode}`;
        res.json({ joinLink });
      } catch (error) {
        res.status(403).json({ message: "Failed to regenerate joinLink" });
        return;
      }
    }),
];


export const getClassroomStudents = [
    checkTeacher,
    asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
      const { classId } = req.params;
      const teacherId = req.user?.id as number;

      const students: Student[] = await classService.getStudentsByClass(Number(classId), teacherId);

      if (!students) {
        res.status(403).json({ message: "Toegang geweigerd" });
        return;
      }

      res.json({ students: students });
    }),
];
