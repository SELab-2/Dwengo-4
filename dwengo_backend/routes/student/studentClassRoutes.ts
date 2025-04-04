import express from "express";
import { getStudentClasses } from "../../controllers/student/studentClassController";
import { protectStudent } from "../../middleware/authMiddleware/studentAuthMiddleware";

const router = express.Router();
router.use(protectStudent);

/**
 * @route GET /class/student
 * @description Get all classes for a student
 * @access Student
 */
router.get("/", getStudentClasses);

export default router;
