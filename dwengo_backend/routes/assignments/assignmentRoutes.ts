import express, { Router } from "express";
import { AssignmentController } from "../../controllers/assignmentController";

const router: Router = express.Router();
const controller = new AssignmentController();

// Geen protectTeacher nodig want teacherId is niet verwacht, iedereen mag de assignments opvragen
router.get("/:assignmentId", controller.getAssignmentsById);

export default router;
