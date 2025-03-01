import * as express from 'express';
import { registerTeacher, loginTeacher } from '../../controllers/teacher/teacherAuthController';

const router = express.Router();

// Route voor registratie van een leerkracht
router.post("/register", registerTeacher);

// Route voor inloggen van een leerkracht
router.post("/login", loginTeacher);

export default router;

