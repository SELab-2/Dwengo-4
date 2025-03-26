import express, { Router } from "express";
import { loginStudent } from "../../controllers/student/studentAuthController";
import { registerStudent } from "../../controllers/userController";
import { validateRequest } from "../../middleware/validateRequest";
import { registerBodySchema } from "../../zodSchemas/authSchemas";

const router: Router = express.Router();

// Registreren van een leerling
router.post(
    "/register",
    validateRequest("invalid request for student registration", registerBodySchema),
    registerStudent
);

// Inloggen van een leerling
router.post("/login", loginStudent);

export default router;
