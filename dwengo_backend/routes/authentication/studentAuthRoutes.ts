import express, { Router } from "express";
import { registerStudent } from "../../controllers/userAuthController";

import { validateRequest } from "../../middleware/validateRequest";
import { loginBodySchema, registerBodySchema } from "../../zodSchemas";

const router: Router = express.Router();

/**
 * @route POST /auth/student/register
 * @desc Register a student
 * @access Public
 */
router.post(
  "/register",
  validateRequest({
    customErrorMessage: "invalid request for student registration",
    bodySchema: registerBodySchema,
  }),
  registerStudent,
);

/**
 * @route POST /auth/student/login
 * @desc Login a student
 * @access Public
 */
router.post(
  "/login",
  validateRequest({
    customErrorMessage: "invalid request for student login",
    bodySchema: loginBodySchema,
  }),
  loginStuden,
);

export default router;
