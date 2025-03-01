import * as express from 'express';
import { protectStudent } from '../../middleware/studentAuthMiddleware';
import { joinClassroom } from '../../controllers/student/studentClassController';

const router = express.Router();

// Alleen studenten mogen deze route gebruiken
router.post("/join", protectStudent, joinClassroom);

export default router;

