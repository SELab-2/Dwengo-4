import express, {Router} from 'express';
import { AssignmentTeacherController } from "../../controllers/teacher/teacherAssignmentController";

const router: Router = express.Router();
const controller = new AssignmentTeacherController();

router.post("/assignments", controller.createAssignmentForClass);
router.get("/assignments/class/:classId", controller.getAssignmentsByClass);
router.patch("/assignments/:assignmentId", controller.updateAssignment);
router.delete("/assignments/:assignmentId", controller.deleteAssignment);

export default router;
