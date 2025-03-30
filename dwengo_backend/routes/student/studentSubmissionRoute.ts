import express, { Router } from "express";
import controller from "../../controllers/student/studentSubmissionController";
import { protectStudent } from "../../middleware/authMiddleware/studentAuthMiddleware";

const router: Router = express.Router();

router.use(protectStudent);

router.get(
  "/assignment/:assignmentId/",
  controller.getSubmissionsForAssignment,
);

router.post(
  "/assignment/:assignmentId/evaluation/:evaluationId",
  controller.createSubmission,
);
router.get(
  "/assignment/:assignmentId/evaluation/:evaluationId",
  controller.getSubmissionsForEvaluation,
);

export default router;
