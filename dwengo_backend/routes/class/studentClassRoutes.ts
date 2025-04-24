import express from "express";
import { protectStudent } from "../../middleware/authMiddleware/studentAuthMiddleware";
import {
  getStudentClassById,
  getStudentClasses,
  leaveClass,
} from "../../controllers/student/studentClassController";

const router = express.Router();
router.use(protectStudent);

/**
 * @route GET /class/student
 * @description Get all classes for a student
 * @access Student
 */
router.get("/", getStudentClasses);

/**
 * @route GET /class/student/:classId
 * @description Get a specific class for a student
 * @param classId: number
 * @access Student
 */
router.get("/:classId", getStudentClassById);

/**
 * @route DELETE /class/student/:classId
 * @description Leave a class
 * @param classId: number
 * @access Student
 */
router.delete("/:classId", leaveClass);

export default router;
