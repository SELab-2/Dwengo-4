import express, { Router } from "express";
import { getStudentAssignments } from "../../controllers/student/studentAssignmentController";
import { protectStudent } from "../../middleware/authMiddleware/studentAuthMiddleware";
import { validateRequest } from "../../middleware/validateRequest";
import { classIdParamsSchema, limitQuerySchema } from "../../zodSchemas";

const router: Router = express.Router();

/**
 * @route GET /assignment/student
 * @description Get all assignments for a student
 * @queryparam sort: string {asc, desc}
 * @queryparam order: string {createdAt, updatedAt, deadline}
 * @queryparam limit: number
 * @access Student
 */
router.get(
  "/",
  protectStudent,
  validateRequest({
    customErrorMessage: "invalid request for student assignments",
    querySchema: limitQuerySchema,
  }),
  getStudentAssignments,
);

/**
 * @route GET /assignment/student/class/:classId
 * @description Get all assignments for a student in a class
 * @param classId: number
 * @queryparam sort: string {asc, desc}
 * @queryparam order: string {createdAt, updatedAt, deadline}
 * @queryparam limit: number
 * @access Student
 */
router.get(
  "/class/:classId",
  protectStudent,
  validateRequest({
    customErrorMessage: "invalid request for student assignments",
    paramsSchema: classIdParamsSchema,
    querySchema: limitQuerySchea,
  }),
  getStudentAssignmentsInClas,
);

export default router;
