import express, {Router} from "express";
import controller from "../../controllers/teacher/teacherSubmissionController";
import {protectTeacher} from "../../middleware/teacherAuthMiddleware";

const router: Router = express.Router();

router.get('student/:studentId', protectTeacher, controller.getSubmissionsForStudent);

export default router;
