import express, { Router } from "express";
import { getStudentAssignments } from "../../controllers/student/studentAssignmentController";
import { protectStudent } from "../../middleware/studentAuthMiddleware";
import { AssignmentController } from "../../controllers/assignmentController";

const controller = new AssignmentController();

const router: Router = express.Router();

/**
 * @route GET /student/assignment
 * @description Get all assignments for a student
 * @queryparam sort: string {asc, desc}
 * @queryparam order: string {createdAt, updatedAt, deadline}
 * @queryparam limit: number
 * @access Student
 */
router.get("/", protectStudent, getStudentAssignments);

/**
 * @route GET /student/assignment/:assignmentId
 * @description Get an assignment by id
 * @access Anyone (Should be checked if user is student is student of this class)
 */
router.get("/:assignmentId", controller.getAssignmentsById);

export default router;
