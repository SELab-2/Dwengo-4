import { Router } from "express";
import { AssignmentController } from "../../controllers/assignmentController";
import teacherAssignmentRoutes from "../teacher/teacherAssignmentRoutes";
import studentAssignmentRoutes from "../student/studentAssignmentRoutes";

const router: Router = Router();
const controller = new AssignmentController();

router.use("/", studentAssignmentRoutes);
router.use("/", teacherAssignmentRoutes);

// Geen protectTeacher nodig want teacherId is niet verwacht, iedereen mag de assignments opvragen
/**
 * @route GET /assignment/:assignmentId
 * @description Get an assignment by id
 * @param assignmentId: number
 * @access Anyone (Should be checked if user is teacher of this class or a student of this class)
 */
router.get("/:assignmentId", controller.getAssignmentsById);

export default router;
