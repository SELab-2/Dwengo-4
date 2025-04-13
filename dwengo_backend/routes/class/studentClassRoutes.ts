import express from "express";
import { protectStudent } from "../../middleware/studentAuthMiddleware";
import {
  getStudentClassById,
  getStudentClasses,
} from "../../controllers/student/studentClassController";

const router = express.Router();
router.use(protectStudent);

/**
 * @route GET /class/student
 * @description Get all classes for a student
 * @access Student
 */
router.get("/", getStudentClasses);

router.get("/:classId", getStudentClassById);

export default router;
