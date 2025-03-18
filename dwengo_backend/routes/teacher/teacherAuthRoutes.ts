import express, {Router} from 'express';
import { loginTeacher } from '../../controllers/teacher/teacherAuthController';
import { registerTeacher } from "../../controllers/userController";

const router: Router = express.Router();

// Route voor registratie van een leerkracht
router.post("/register", registerTeacher);

// Route voor inloggen van een leerkracht
router.post("/login", loginTeacher);

export default router;

