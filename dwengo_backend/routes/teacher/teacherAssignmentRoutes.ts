import express, { Router } from 'express';
import { AssignmentTeacherController } from "../../controllers/teacher/teacherAssignmentController";
import { protectTeacher } from "../../middleware/teacherAuthMiddleware";

const router: Router = express.Router();
const controller = new AssignmentTeacherController();

router.post("/", protectTeacher, controller.createAssignmentForClass);
router.post("/teams", protectTeacher, controller.createAssignmentWithTeams);
router.get("/class/:classId", protectTeacher, controller.getAssignmentsByClass);
router.patch("/:assignmentId", protectTeacher, controller.updateAssignment);
router.delete("/:assignmentId", protectTeacher, controller.deleteAssignment);

export default router;
