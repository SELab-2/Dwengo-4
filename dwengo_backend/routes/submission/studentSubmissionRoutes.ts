import express, { Router } from "express";
import { protectStudent } from "../../middleware/authMiddleware/studentAuthMiddleware";
import StudentSubmissionController from "../../controllers/student/studentSubmissionController";
import { validateRequest } from "../../middleware/validateRequest";
import {
  assignmentAndEvaluationIdParamSchema,
  assignmentIdParamsSchema,
} from "../../zodSchemas";

const router: Router = express.Router();
const controller = new StudentSubmissionController();

router.use(protectStudent);

/**
 * @route GET /submission/student/assignment/:assignmentId
 * @description Get all submissions of the student and its team for a specific assignment
 * @param assignmentId: number
 * @access Student
 */
router.get(
  "/assignment/:assignmentId/",
  validateRequest({
    customErrorMessage: "invalid assignmentId request parameter",
    paramsSchema: assignmentIdParamsSchema,
  }),
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
  validateRequest({
    customErrorMessage:
      "invalid assignmentId or evaluationId request parameter",
    paramsSchema: assignmentAndEvaluationIdParamSchema,
  }),
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
  validateRequest({
    customErrorMessage:
      "invalid assignmentId or evaluationId request parameter",
    paramsSchema: assignmentAndEvaluationIdParamSchema,
  }),
  controller.getSubmissionsForEvaluation,
);

export default router;
