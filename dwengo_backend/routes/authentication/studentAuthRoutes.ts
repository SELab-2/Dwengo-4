import express, { Router } from "express";
import { loginStudent } from "../../controllers/student/studentAuthController";
import { registerStudent } from "../../controllers/userController";

const router: Router = express.Router();

/**
 * @route POST /auth/student/register
 * @desc Register a student
 * @access Public
 */
router.post("/register", registerStudent);

/**
 * @route POST /auth/student/login
 * @desc Login a student
 * @access Public
 */
router.post("/login", loginStudent);

export default router;
