import express, { Router } from "express";
import {
  registerTeacher,
  loginTeacher,
} from "../../controllers/userAuthController";
import { validateRequest } from "../../middleware/validateRequest";
import {
  loginBodySchema,
  registerBodySchema,
} from "../../zodSchemas/authSchemas";

const router: Router = express.Router();

/**
 * @route POST /auth/teacher/register
 * @desc Register a teacher
 * @access Public
 */
router.post(
  "/register",
  validateRequest({
    customErrorMessage: "invalid request for teacher registration",
    bodySchema: registerBodySchema,
  }),
  registerTeacher,
);

/**
 * @route POST /auth/teacher/login
 * @desc Login a teacher
 * @access Public
 */
router.post(
  "/login",
  validateRequest({
    customErrorMessage: "invalid request for teacher login",
    bodySchema: loginBodySchema,
  }),
  loginTeacher,
);

export default router;
