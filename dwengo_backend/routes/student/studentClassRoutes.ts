import express from 'express';
import { protectStudent } from '../../middleware/studentAuthMiddleware';
import { createJoinRequest } from '../../controllers/joinrequest/joinRequestController'

const router = express.Router();

// Alleen studenten mogen deze route gebruiken
router.post("/join", protectStudent, createJoinRequest);

// kan een student al een overzicht van al z'n klassen zien? 

export default router;

