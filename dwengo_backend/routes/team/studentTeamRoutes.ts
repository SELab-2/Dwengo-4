import { Router } from "express";

import {
  getStudentTeams,
  getTeamByAssignment,
} from "../../controllers/student/studentTeamController";
import { protectStudent } from "../../middleware/authMiddleware/studentAuthMiddleware";

const router = Router();
router.use(protectStudent);

//////////////////////
/// STUDENT ROUTES ///
//////////////////////

// Haal alle teams op waarin de ingelogde student zit
/**
 * @route GET /team/student
 * @description Get all teams of the logged in student
 * @access Student
 */
router.get("/", getStudentTeams);

// Haal een specifiek team op aan de hand van assignmentId
/**
 * @route GET /team/student/assignment/:assignmentId/studentTeam
 * @description Get a specific team by assignmentId
 * @param assignmentId: number
 * @access Student
 */
router.get(
  "/assignment/:assignmentId/studentTeam",
  protectStudent,
  getTeamByAssignment,
);

export default router;
