import express, {Router} from 'express';
import { loginStudent } from '../../controllers/student/studentAuthController';
import { registerStudent } from '../../controllers/userController';

const router: Router = express.Router();

// Registreren van een leerling
router.post("/register", registerStudent);

// Inloggen van een leerling
router.post("/login", loginStudent);

export default router;

