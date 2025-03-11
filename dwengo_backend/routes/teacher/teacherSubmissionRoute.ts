import express, {Router} from "express";
import controller from "../../controllers/teacher/teacherSubmissionController";
import {protectTeacher} from "../../middleware/teacherAuthMiddleware";

const router: Router = express.Router();

router.get('student/:studentId', protectTeacher, controller.getSubmissionsForStudent);
router.get('team/:teamId', protectTeacher, controller.getSubmissionsForTeam);

router.get('assignment/:assignmentId/student/:studentId', protectTeacher, controller.getAssignmentSubmissionsForStudent);
router.get('assignment/:assignmentId/team/:teamId', protectTeacher, controller.getAssignmentSubmissionsForTeam);


export default router;
