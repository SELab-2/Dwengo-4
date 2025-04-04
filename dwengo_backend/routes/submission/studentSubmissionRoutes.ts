import express, { Router } from "express";
import controller from "../../controllers/student/studentSubmissionController";
import { protectStudent } from "../../middleware/authMiddleware/studentAuthMiddleware";

const router: Router = express.Router();

router.use(protectStudent);

/**
 * @route GET /submission/student/assignment/:assignmentId
 * @description Get all submissions of the student and its team for a specific assignment
 * @param assignmentId: number
 * @access Student
 */
router.get(
  "/assignment/:assignmentId/",
  controller.getSubmissionsForAssignment,
);

/**
 * @route POST /submission/student/assignment/:assignmentId/evaluation/:evaluationId
 * @description Create a submission for a specific evaluation in an assignment
 * @param assignmentId: number
 * @param evaluationId: string
 * @access Student
 */
router.post(
  "/assignment/:assignmentId/evaluation/:evaluationId",
  controller.createSubmission,
);

/**
 * @route GET /submission/student/assignment/:assignmentId/evaluation/:evaluationId
 * @description Get all submissions of the student and its team for a specific evaluation in an assignment
 * @param assignmentId: number
 * @param evaluationId: string
 * @access Student
 */
router.get(
  "/assignment/:assignmentId/evaluation/:evaluationId",
  controller.getSubmissionsForEvaluation,
);

export default router;
