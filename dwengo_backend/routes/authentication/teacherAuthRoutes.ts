import express, { Router } from "express";
import { loginTeacher } from "../../controllers/teacher/teacherAuthController";
import { registerTeacher } from "../../controllers/userController";

const router: Router = express.Router();

/**
 * @route POST /auth/teacher/register
 * @desc Register a teacher
 * @access Public
 */
router.post("/register", registerTeacher);

/**
 * @route POST /auth/teacher/login
 * @desc Login a teacher
 * @access Public
 */
router.post("/login", loginTeacher);

export default router;
