import express, { Router } from "express";
import {
  createProgress,
  getStudentProgress,
  updateProgress,
  getTeamProgressStudent,
  getStudentAssignmentProgress,
  getTeamProgressTeacher,
  getAssignmentAverageProgress,
} from "../controllers/progressController";
import { protectStudent } from "../middleware/studentAuthMiddleware";
import { protectTeacher } from "../middleware/teacherAuthMiddleware";

const router: Router = express.Router();

// Student endpoints
router.post("/:learningObjectId", protectStudent, createProgress);
router.get("/:learningObjectId", protectStudent, getStudentProgress);
router.patch("/:learningObjectId", protectStudent, updateProgress);
router.get("/student/:teamid", protectStudent, getTeamProgressStudent);
router.get("/student/assignment/:assignmentId", protectStudent, getStudentAssignmentProgress);

// Teacher endpoints
router.get("/teacher/:teamid", protectTeacher, getTeamProgressTeacher);
router.get("/teacher/:assignmentId/average", protectTeacher, getAssignmentAverageProgress);

export default router;
