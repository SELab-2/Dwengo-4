import asyncHandler from "express-async-handler";
import { Response } from "express";
import { AuthenticatedRequest } from "../../middleware/authMiddleware/teacherAuthMiddleware";
import classService from "../../services/classService";
import { Student } from "@prisma/client";
import { getUserFromAuthRequest } from "../../helpers/getUserFromAuthRequest";
import { BadRequestError } from "../../errors/errors";

const APP_URL = process.env.APP_URL || "http://localhost:5000";

export const isNameValid = (req: AuthenticatedRequest): void => {
  const { name } = req.body;
  if (!name || typeof name !== "string" || name.trim() === "") {
    throw new BadRequestError("Class name is not valid.");
  }
};

/**
 * Get all classes that a teacher manages
 * @route GET /class/teacher
 * returns a list of all classes in the response body
 */
export const getTeacherClasses = asyncHandler(
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const teacherId: number = getUserFromAuthRequest(req).id;
    const classrooms = await classService.getClassesByTeacher(teacherId);
    res.status(200).json({ classrooms });
  },
);

/**
 * Create classroom
 * @route POST /class/teacher
 * returns the created class in the response body
 */
export const createClassroom = asyncHandler(
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { name } = req.body;
    const teacherId: number = getUserFromAuthRequest(req).id;

    isNameValid(req); // if invalid, an error is thrown

    const classroom = await classService.createClass(name, teacherId);
    res.status(201).json({ message: "Class successfully created.", classroom });
  },
);

/**
 * Delete classroom
 * @route DELETE /class/teacher/:classId
 * deletes the classroom with the given ID
 */
export const deleteClassroom = asyncHandler(
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { classId } = req.params;
    const teacherId = getUserFromAuthRequest(req).id;

    await classService.deleteClass(Number(classId), teacherId);
    res.status(204).end();
  },
);

/**
 * Update classroom
 * returns the updated class in the response body
 */
export const updateClassroom = asyncHandler(
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { name } = req.body;
    const classId: number = parseInt(req.params.classId);
    const teacherId: number = getUserFromAuthRequest(req).id;

    isNameValid(req); // if invalid, an error is thrown

    const classroom = await classService.updateClass(classId, teacherId, name);
    res.status(200).json({ message: "Class successfully updated.", classroom });
  },
);

/**
 * Get join link
 * returns the join link for the class
 */
export const getJoinLink = asyncHandler(
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { classId } = req.params;
    const teacherId = getUserFromAuthRequest(req).id;

    const joinCode = await classService.getJoinCode(Number(classId), teacherId);

    const joinLink = `${APP_URL}/join-request/student/join?joinCode=${joinCode}`;
    res.status(200).json({ joinLink });
  },
);

/**
 * Regenerate join link
 * returns the new join link for the class
 */
export const regenerateJoinLink = asyncHandler(
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { classId } = req.params;
    const teacherId = getUserFromAuthRequest(req).id;
    const newJoinCode = await classService.regenerateJoinCode(
      Number(classId),
      teacherId,
    );
    const joinLink = `${APP_URL}/join-request/student/join?joinCode=${newJoinCode}`;
    res.json({ message: "Join link successfully recreated.", joinLink });
  },
);

/**
 * returns a list of all classes for the authenticated teacher in the response body with their students
 */
export const getClassroomsStudents = asyncHandler(
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const teacherId: number = getUserFromAuthRequest(req).id;
    const classrooms = await classService.getAllClassesByTeacher(
      teacherId,
      true,
    );
    res.status(200).json({ classrooms });
  },
);

/**
 * Get classroom students
 * @route GET /class/teacher/:classId/student
 * returns a list of all students in the class
 */
export const getStudentsByClassId = asyncHandler(
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { classId } = req.params;
    const teacherId = getUserFromAuthRequest(req).id;

    const students: Student[] = await classService.getStudentsByClass(
      Number(classId),
      teacherId,
    );

    res.json({ students });
  },
);

/**
 * Get all classrooms
 * @query includeStudents - optional query parameter to include student details
 * returns a list of all classes for the authenticated teacher in the response body
 */
export const getAllClassrooms = asyncHandler(
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const teacherId: number = getUserFromAuthRequest(req).id;
    const includeStudents = req.query.includeStudents === "true";
    const classrooms = await classService.getAllClassesByTeacher(
      teacherId,
      includeStudents,
    );
    res.status(200).json({ classrooms });
  },
);

/**
 * Get classroom by ID
 * @route GET /class/teacher/:classId
 * @param classId - id of the class to be fetched
 * returns the class details in the response body
 */
export const getClassByIdAndTeacherId = asyncHandler(
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const classId: number = parseInt(req.params.classId);
    const teacherId: number = getUserFromAuthRequest(req).id;

    const classroom = await classService.getClassByIdAndTeacherId(
      classId,
      teacherId,
    );

    res.status(200).json({ classroom });
  },
);
