import express, { Router } from "express";
import controller from "../../controllers/teacher/teacherSubmissionController";
import { protectTeacher } from "../../middleware/authMiddleware/teacherAuthMiddleware";

const router: Router = express.Router();

router.use(protectTeacher);

router.get("/student/:studentId", controller.getSubmissionsForStudent);
router.get("/team/:teamId", controller.getSubmissionsForTeam);

router.get(
  "/assignment/:assignmentId/student/:studentId",
  controller.getAssignmentSubmissionsForStudent,
);
router.get(
  "/assignment/:assignmentId/team/:teamId",
  controller.getAssignmentSubmissionsForTeam,
);

export default router;
