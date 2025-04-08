import express from "express";
import FeedbackController from "../../controllers/teacher/feedbackController";
import { protectTeacher } from "../../middleware/authMiddleware/teacherAuthMiddleware";

const router = express.Router();
const controller = new FeedbackController();

router.use(protectTeacher);

/**
 * @route GET /feedback/assignment/:assignmentId/evaluation/:evaluationId
 * @desc Get all feedback for an evaluation
 * @param assignmentId: number
 * @param evaluationId: string
 * @access Teacher
 */
router.get(
  "/assignment/:assignmentId/evaluation/:evaluationId",
  controller.getAllFeedbackForEvaluation,
);

/**
 * @route GET /feedback/submission/:submissionId
 * @desc Get feedback for a submission
 * @param submissionId: number
 * @access Teacher
 */
router.get("/submission/:submissionId", controller.getFeedbackForSubmission);

/**
 * @route PATCH /feedback/submission/:submissionId
 * @desc Update feedback for a submission
 * @param submissionId: number
 * @access Teacher
 */
router.patch(
  "/submission/:submissionId",
  controller.updateFeedbackForSubmission,
);

/**
 * @route DELETE /feedback/submission/:submissionId
 * @desc Delete feedback for a submission
 * @param submissionId: number
 * @access Teacher
 */
router.delete(
  "/submission/:submissionId",
  controller.deleteFeedbackForSubmission,
);

/**
 * @route POST /feedback
 * @desc Create feedback for a submission
 * @body submissionId: number
 * @body description: string
 * @access Teacher
 */
router.post("/submission/:submissionId", controller.createFeedback);

export default router;
