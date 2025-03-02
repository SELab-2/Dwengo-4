import express from 'express';
import { AssignmentTeacherController } from "../../controllers/teacher/teacherAssignmentController";

const router = express.Router();
const controller = new AssignmentTeacherController();

router.post("/assignments", controller.createAssignment);
router.get("/assignments/class/:classId", controller.getAssignmentsByClass);
router.put("/assignments/:assignmentId", controller.updateAssignment);
router.delete("/assignments/:assignmentId", controller.deleteAssignment);

export default router;
