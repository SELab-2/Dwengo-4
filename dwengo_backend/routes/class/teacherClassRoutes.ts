import express, { Router } from "express";
import {
  createClassroom,
  deleteClassroom,
  getClassroomsStudents,
  getJoinLink,
  getTeacherClasses,
  regenerateJoinLink,
  getClassByIdAndTeacherId,
  updateClassroom,
  getStudentsByClassId,
} from "../../controllers/teacher/teacherClassController";
import { protectTeacher } from "../../middleware/authMiddleware/teacherAuthMiddleware";
import { validateRequest } from "../../middleware/validateRequest";
import { classIdParamsSchema } from "../../zodSchemas";

const router: Router = express.Router();
router.use(protectTeacher);

// routes for classes

/**
 * @route POST /class/teacher
 * @description Create a classroom
 * @body name: string
 * @access Teacher
 */
router.post("/", createClassroom);

/**
 * @route GET /class/teacher
 * @description Get all classes for a teacher
 * @access Teacher
 */
router.get("/", getTeacherClasses);

/**
 * @route PATCH /class/teacher/:classId
 * @description Update a classroom
 * @param classId: string
 * @body name: string
 * @access Teacher
 */
router.patch(
  "/:classId",
  validateRequest({
    customErrorMessage: "invalid classId request parameter",
    paramsSchema: classIdParamsSchema,
  }),
  updateClassroom,
);

/**
 * @route GET /class/teacher/student
 * @description Get all students in all classrooms
 * @access Teacher
 */
router.get("/student", getClassroomsStudents);

/**
 * @route GET /class/teacher/:classId/student
 * @description Get all students in a classroom
 * @param classId: number
 * @access Teacher
 */
router.get(
  "/:classId/student",
  validateRequest({
    customErrorMessage: "invalid classId request parameter",
    paramsSchema: classIdParamsSchema,
  }),
  getStudentsByClassId,
);

/**
 * @route GET /class/teacher/:classId/join-link
 * @description Get the join link for a classroom
 * @param classId: string
 * @access Teacher
 */
router.get(
  "/:classId/join-link",
  validateRequest({
    customErrorMessage: "invalid classId request parameter",
    paramsSchema: classIdParamsSchema,
  }),
  getJoinLink,
);

/**
 * @route PATCH /class/teacher/:classId/join-link
 * @description Regenerate the join link for a classroom
 * @param classId: string
 * @access Teacher
 */
router.patch(
  "/:classId/join-link",
  validateRequest({
    customErrorMessage: "invalid classId request parameter",
    paramsSchema: classIdParamsSchema,
  }),
  regenerateJoinLink,
);

/**
 * @route GET /class/teacher/:classId
 * @description Get a classroom by ID
 * @param classId: string
 * @access Teacher
 */
router.get(
  "/:classId",
  validateRequest({
    customErrorMessage: "invalid classId request parameter",
    paramsSchema: classIdParamsSchema,
  }),
  getClassByIdAndTeacherId,
);

/**
 * @route DELETE /class/teacher/:classId
 * @description Delete a classroom
 * @param classId: string
 * @access Teacher
 */
router.delete(
  "/:classId",
  validateRequest({
    customErrorMessage: "invalid classId request parameter",
    paramsSchema: classIdParamsSchema,
  }),
  deleteClassroom,
);

export default router;
