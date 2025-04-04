import express, { Router } from "express";
import controller from "../../controllers/teacher/teacherSubmissionController";
import { protectTeacher } from "../../middleware/authMiddleware/teacherAuthMiddleware";

const router: Router = express.Router();

router.use(protectTeacher);

/**
 * @route GET /submission/teacher/student/:studentId
 * @description Get all submissions of a student
 * @param studentId: number
 * @access Teacher
 */
router.get("/student/:studentId", controller.getSubmissionsForStudent);

/**
 * @route GET /submission/teacher/team/:teamId
 * @description Get all submissions of a team
 * @param teamId: number
 * @access Teacher
 */
router.get("/team/:teamId", controller.getSubmissionsForTeam);

/**
 * @route GET /submission/teacher/assignment/:assignmentId/team/:teamId
 * @description Get all submissions of a team for a specific assignment
 * @param assignmentId: number
 * @param teamId: number
 * @access Teacher
 */
router.get(
  "/assignment/:assignmentId/team/:teamId",
  controller.getAssignmentSubmissionsForTeam,
);

export default router;
