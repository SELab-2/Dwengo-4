import { Router } from "express";
import { AssignmentController } from "../../controllers/assignmentController";
import teacherAssignmentRoutes from "./teacherAssignmentRoutes";
import studentAssignmentRoutes from "./studentAssignmentRoutes";
import { validateRequest } from "../../middleware/validateRequest";
import { assignmentIdParamsSchema } from "../../zodSchemas";

const router: Router = Router();
const controller = new AssignmentController();

router.use("/student", studentAssignmentRoutes);
router.use("/teacher", teacherAssignmentRoutes);

// Geen protectTeacher nodig want teacherId is niet verwacht, iedereen mag de assignments opvragen
/**
 * @route GET /assignment/:assignmentId
 * @description Get an assignment by id
 * @param assignmentId: number
 * @access Anyone (Should be checked if user is teacher of this class or a student of this class)
 */
router.get(
  "/:assignmentId",
  validateRequest({
    customErrorMessage: "invalid request for getting assignments",
    paramsSchema: assignmentIdParamsSchema,
  }),
  controller.getAssignmentsById,
);

export default router;
