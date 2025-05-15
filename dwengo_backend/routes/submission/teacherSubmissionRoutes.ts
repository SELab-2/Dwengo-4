import express, { Router } from "express";
import TeacherSubmissionController from "../../controllers/teacher/teacherSubmissionController";
import { protectTeacher } from "../../middleware/authMiddleware/teacherAuthMiddleware";
import { validateRequest } from "../../middleware/validateRequest";
import {
  studentIdParamsSchema,
  teamAndAssignmentIdParamsSchema,
  teamIdParamsSchema,
} from "../../zodSchemas";

const router: Router = express.Router();
const controller: TeacherSubmissionController =
  new TeacherSubmissionController();

router.use(protectTeacher);

/**
 * @route GET /submission/teacher/student/:studentId
 * @description Get all submissions of a student
 * @param studentId: number
 * @access Teacher
 */
router.get(
  "/student/:studentId",
  validateRequest({
    customErrorMessage: "invalid studentId request parameter",
    paramsSchema: studentIdParamsSchem,
  }),
  controller.getSubmissionsForStuden,
);

/**
 * @route GET /submission/teacher/team/:teamId
 * @description Get all submissions of a team
 * @param teamId: number
 * @access Teacher
 */
router.get(
  "/team/:teamId",
  validateRequest({
    customErrorMessage: "invalid teamId request parameter",
    paramsSchema: teamIdParamsSchema,
  }),
  controller.getSubmissionsForTeam,
);

/**
 * @route GET /submission/teacher/assignment/:assignmentId/team/:teamId
 * @description Get all submissions of a team for a specific assignment
 * @param assignmentId: number
 * @param teamId: number
 * @access Teacher
 */
router.get(
  "/assignment/:assignmentId/team/:teamId",
  validateRequest({
    customErrorMessage: "invalid assignmentId or teamId request parameter",
    paramsSchema: teamAndAssignmentIdParamsSchea,
  }),
  controller.getAssignmentSubmissionsForTeam,
);

export default router;
