import asyncHandler from "express-async-handler";
import { Response } from "express";
import { AuthenticatedRequest } from "../../middleware/teacherAuthMiddleware";
import classService from "../../services/classService";
import { Student, User } from "@prisma/client";
import { getUserFromAuthRequest } from "../../helpers/getUserFromAuthRequest";
import { BadRequestError } from "../../errors/errors";

const APP_URL = process.env.APP_URL || "http://localhost:5000";

export const isTeacherValid = (
  req: AuthenticatedRequest,
  res: Response
): boolean => {
  const teacherId = req.user?.id;
  if (!teacherId) {
    res.status(400).json({ message: "Geen toegang" });
    return false; // Teacher is not authorized
  }
  return true; // Teacher is authorized
};

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
 * returns the created class in the response body
 */
export const createClassroom = asyncHandler(
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { name } = req.body;
    const teacherId: number = getUserFromAuthRequest(req).id;

    isNameValid(req, res); // if invalid, an error is thrown

    const classroom = await classService.createClass(name, teacherId);
    res.status(201).json({ message: "Klas aangemaakt", classroom });
  }
);

/**
 * Delete a classroom
 * @param classId - id of the class to be deleted
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
 * returns the join link in the response body
 */
export const getJoinLink = asyncHandler(
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const classId: number = parseInt(req.params.classId);
    const teacherId: number = getUserFromAuthRequest(req).id;

    const joinCode = await classService.getJoinCode(classId, teacherId);

    const joinLink = `${APP_URL}/class/teacher/join?joinCode=${joinCode}`;
    res.status(200).json({ joinLink });
  }
);

/**
 * Regenerate join link
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
    const joinLink = `${APP_URL}/class/teacher/join?joinCode=${newJoinCode}`;
    res.status(200).json({ joinLink });
  }
);

/**
 * Get all classrooms
 * @route GET /teacher/classes
 * returns a list of all classes for the authenticated teacher in the response body
 */
export const getClassroomStudents = asyncHandler(
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const classId: number = parseInt(req.params.classId);
    const teacherId: number = getUserFromAuthRequest(req).id;
    const classrooms = await classService.getAllClassesByTeacher(teacherId);
    res.status(200).json({ classrooms });
  }
);

/**
 * Get all classrooms
 * @route GET /teacher/classes
 * @query includeStudents - optional query parameter to include student details
 * returns a list of all classes for the authenticated teacher in the response body
 */
export const getAllClassrooms = asyncHandler(
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const teacherId: number = getUserFromAuthRequest(req).id;
    const includeStudents = req.query.includeStudents === "true";
    const classrooms = await classService.getAllClassesByTeacher(
      teacherId,
      includeStudents
    );
    res.status(200).json({ classrooms });
  }
);



/**
 * Get classroom by ID
 * @route GET /teacher/classes/:classId
 * @param classId - id of the class to be fetched
 * returns the class details in the response body
 */
export const getClassByIdAndTeacherId = asyncHandler(
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const classId: number = parseInt(req.params.classId);
    const teacherId: number = getUserFromAuthRequest(req).id;

    const classroom = await classService.getClassByIdAndTeacherId(
      classId,
      teacherId
    );
    if (!classroom) {
      throw new BadRequestError(`Klas met id ${classId} niet gevonden`);
    }

    res.status(200).json({ classroom });
  }
);

