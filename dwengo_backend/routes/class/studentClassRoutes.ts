import express from "express";
import { protectStudent } from "../../middleware/studentAuthMiddleware";
import { createJoinRequest } from "../../controllers/joinrequest/joinRequestController";
import { getStudentClasses } from "../../controllers/student/studentClassController";

const router = express.Router();

// Alleen studenten mogen deze route gebruiken
router.use(protectStudent);

/**
 * @route POST /class/join
 * @description Create a join request for a class
 * @body joinCode: number
 * @access Student
 */
router.post("/join", createJoinRequest);

/**
 * @route GET /class/student
 * @description Get all classes for a student
 * @access Student
 */
router.get("/student", getStudentClasses);

export default router;
