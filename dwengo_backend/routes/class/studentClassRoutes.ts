import express from "express";
import { protectStudent } from "../../middleware/studentAuthMiddleware";
import { getStudentClasses } from "../../controllers/student/studentClassController";

const router = express.Router();

/**
 * @route GET /class/student
 * @description Get all classes for a student
 * @access Student
 */
router.get("/", protectStudent, getStudentClasses);

export default router;
