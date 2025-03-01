import * as express from 'express';
import { registerStudent, loginStudent } from '../../controllers/student/studentAuthController';

const router = express.Router();

// Registreren van een leerling
router.post("/register", registerStudent);

// Inloggen van een leerling
router.post("/login", loginStudent);

export default router;

