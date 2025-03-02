import express from "express";
import { getStudentAssignments, getClosestDeadlines } from "../../controllers/student/studentAssignmentController";
import { protectStudent } from "../../middleware/studentAuthMiddleware";

const router = express.Router();

router.get("/", protectStudent, getStudentAssignments);
router.get("/closest", protectStudent, getClosestDeadlines);

export default router;
