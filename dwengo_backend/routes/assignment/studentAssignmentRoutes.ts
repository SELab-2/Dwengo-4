import express, { Router } from "express";
import { getStudentAssignments } from "../../controllers/student/studentAssignmentController";
import { protectStudent } from "../../middleware/studentAuthMiddleware";

const router: Router = express.Router();

/**
 * @route GET /assignment/student
 * @description Get all assignments for a student
 * @queryparam sort: string {asc, desc}
 * @queryparam order: string {createdAt, updatedAt, deadline}
 * @queryparam limit: number
 * @access Student
 */
router.get("/", protectStudent, getStudentAssignments);

export default router;
