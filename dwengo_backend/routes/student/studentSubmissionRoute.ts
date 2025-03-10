import express, {Router} from "express";
import controller from "../../controllers/student/studentSubmissionController";
import {protectStudent} from "../../middleware/studentAuthMiddleware";

const router: Router = express.Router();

router.get('assignment/:assignmentId/', protectStudent, controller.getSubmissionsForAssignment)

router.post('assignment/:assignmentId/evaluation/:evaluationId', protectStudent, controller.createSubmission)

export default router;
