import asyncHandler from "express-async-handler";
import { Response } from "express";
import { AuthenticatedRequest } from "../../interfaces/extendedTypeInterfaces";
import classService from "../../services/classService";
import { Student, User } from "@prisma/client";
import { getUserFromAuthRequest } from "../../helpers/getUserFromAuthRequest";
import { BadRequestError } from "../../errors/errors";

const APP_URL = process.env.APP_URL || "http://localhost:5000";

export const isNameValid = (
  req: AuthenticatedRequest,
  res: Response
): boolean => {
  const { name } = req.body;
  if (!name || typeof name !== "string" || name.trim() === "") {
    throw new BadRequestError("Vul een geldige klasnaam in");
  }
  return true;
};

/**
 * Get all classes that a teacher manages
 * @route GET /teacher/classes
 * returns a list of all classes in the response body
 */
export const getTeacherClasses = asyncHandler(
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const teacherId: number = getUserFromAuthRequest(req).id;
    const classes = await classService.getClassesByTeacher(teacherId);
    res.status(200).json({ classes });
  }
);

/**
 * Create classroom
 * @route POST /teacher/classes
 * returns the created class in the response body
 */
export const createClassroom = asyncHandler(
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { name } = req.body;
    const teacherId: number = getUserFromAuthRequest(req).id;

    isNameValid(req, res); // if invalid, an error is thrown
    isNameValid(req, res); // if invalid, an error is thrown

    const classroom = await classService.createClass(name, teacherId);
    res.status(201).json({ message: "Klas aangemaakt", classroom });
  }
);

/**
 * Delete a classroom
 * @route DELETE /teacher/classes/:classId
 * @param classId - id of the class to be deleted
 */
 */
export const deleteClassroom = asyncHandler(
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const classId: number = parseInt(req.params.classId);
    const teacherId: number = getUserFromAuthRequest(req).id;

    await classService.deleteClass(classId, teacherId);
    res.status(200).json({ message: `Klas met id ${classId} verwijderd` });
  }
);

/**
 * Get join link
 * @route GET /teacher/classes/:classId/join-link
 * @param classId - id of the class for which the join link is fetched
 * returns the join link in the response body
 */
export const getJoinLink = asyncHandler(
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const classId: number = parseInt(req.params.classId);
    const teacherId: number = getUserFromAuthRequest(req).id;

    const joinCode = await classService.getJoinCode(classId, teacherId);

    const joinLink = `${APP_URL}/student/classes/join?joinCode=${joinCode}`;
    res.status(200).json({ joinLink });
  }
);

/**
 * Regenerate join link
 * @route PATCH /teacher/classes/:classId/regenerate-join-link
 * @param classId - id of the class for which the join link is regenerated
 * returns the new join link in the response body
 */
export const regenerateJoinLink = asyncHandler(
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const classId: number = parseInt(req.params.classId);
    const teacherId: number = getUserFromAuthRequest(req).id;

    const newJoinCode = await classService.regenerateJoinCode(
      classId,
      teacherId
    );
    const joinLink = `${APP_URL}/student/classes/join?joinCode=${newJoinCode}`;
    res.status(200).json({ joinLink });
  }
);

/**
 * Get classroom students
 * @route GET /teacher/classes/:classId/students
 * @param classId - id of the class for which the students are fetched
 * returns a list of all students in the class in the response body
 */
export const getClassroomStudents = asyncHandler(
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const classId: number = parseInt(req.params.classId);
    const teacherId: number = getUserFromAuthRequest(req).id;

    // include user details of the students
    const students: (Student & { user: User })[] =
      await classService.getStudentsByClass(classId, teacherId);
    const students: (Student & { user: User })[] =
      await classService.getStudentsByClass(classId, teacherId);
    res.status(200).json({ students });
  }
);
