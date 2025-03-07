import express, { Router } from "express";
import { getStudentAssignments } from "../../controllers/student/studentAssignmentController";
import { protectStudent } from "../../middleware/studentAuthMiddleware";

const router: Router = express.Router();

router.get("/", protectStudent, getStudentAssignments);

export default router;
