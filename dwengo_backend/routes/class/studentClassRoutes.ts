import express from "express";
import { protectStudent } from "../../middleware/studentAuthMiddleware";
import { createJoinRequest } from "../../controllers/joinrequest/joinRequestController";
import { getStudentClasses } from "../../controllers/student/studentClassController";

const router = express.Router();

/**
 * @route POST /class/student/join
 * @description Create a join request for a class
 * @body joinCode: number
 * @access Student
 */
router.post("/join", protectStudent, createJoinRequest);

/**
 * @route GET /class/student
 * @description Get all classes for a student
 * @access Student
 */
router.get("/student", protectStudent, getStudentClasses);

export default router;
