import express from "express";
import controller from "../../controllers/teacher/feedbackController";
import {protectTeacher} from "../../middleware/teacherAuthMiddleware";

const router = express.Router();

router.get('assignment/:assignmentId/evaluation/:evaluationId', protectTeacher, controller.getAllFeedbackForEvaluation);
router.get('submission/:submissionId', protectTeacher, controller.getFeedbackForSubmission);
router.patch('submission/:submissionId', protectTeacher, controller.updateFeedbackForSubmission);
router.delete('submission/:submissionId', protectTeacher, controller.deleteFeedbackForSubmission);

router.post('/', protectTeacher, controller.createFeedback);


export default router;
