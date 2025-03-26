import express, { Router } from "express";
import { loginTeacher } from "../../controllers/teacher/teacherAuthController";
import { registerTeacher } from "../../controllers/userController";
import { validateRequest } from "../../middleware/validateRequest";
import { loginBodySchema, registerBodySchema } from "../../zodSchemas/authSchemas";

const router: Router = express.Router();

// Route voor registratie van een leerkracht
router.post(
    "/register",
    validateRequest("invalid request for teacher registration", registerBodySchema),
    registerTeacher
);

// Route voor inloggen van een leerkracht
router.post(
    "/login",
    validateRequest("invalid request for teacher login", loginBodySchema),
    loginTeacher
);

export default router;
