import express, {Router} from "express";
import controller from "../../controllers/student/studentSubmissionController";
import {protectStudent} from "../../middleware/studentAuthMiddleware";

const router: Router = express.Router();

router.get('assignment/:assignmentId/', protectStudent, controller.getSubmissionsForAssignment)

router.post('assignment/:assignmentId/evaluation/:evaluationId', protectStudent, controller.createSubmission)
router.get('assignment/:assignmentId/evaluation/:evaluationId', protectStudent, controller.getSubmissionsForEvaluation)

export default router;
