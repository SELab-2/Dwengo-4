import { Response } from "express";
import asyncHandler from "express-async-handler";
import classService from "../../services/classService";
import { AuthenticatedRequest } from "../../interfaces/extendedTypeInterfaces";
import { getUserFromAuthRequest } from "../../helpers/getUserFromAuthRequest";

/**
 * Get all classes that a student is partaking in
 * @route GET /student/classes
 * returns a list of all classes the student is partaking in in the response body
 */
export const getStudentClasses = asyncHandler(
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const studentId: number = getUserFromAuthRequest(req).id;
    const classrooms = await classService.getClassesByStudent(studentId);
    res.status(200).json({ classrooms });
  },
);

export const leaveClass = asyncHandler(
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const studentId: number = getUserFromAuthRequest(req).id;
    const classId: number = parseInt(req.params.classId);

    await classService.leaveClassAsStudent(studentId, classId);
    res.status(204).json({ message: "Student successfully left class." });
  },
);
