import express from "express";
import { protectStudent } from "../../middleware/authMiddleware/studentAuthMiddleware";
import { createJoinRequest } from "../../controllers/joinrequest/joinRequestController";
import { getStudentClasses } from "../../controllers/student/studentClassController";

const router = express.Router();

// Alleen studenten mogen deze route gebruiken
router.use(protectStudent);

router.post("/join", createJoinRequest);
router.get("/", getStudentClasses);

export default router;
