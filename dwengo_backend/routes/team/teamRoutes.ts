import { Router } from "express";

import {
  createTeamInAssignment,
  getTeamsInAssignment,
  updateTeamsInAssignment,
  deleteTeamInAssignment,
} from "../../controllers/teacher/teacherTeamsController";
import {
  makeAssignmentIdParamValid,
  makeTeamIdParamValid,
  ensureTeamsParamValidTeamDivision,
  ensureTeamParamValidIdentifiableTeamDivision,
} from "../../middleware/teamValidationMiddleware";
import { protectTeacher } from "../../middleware/teacherAuthMiddleware";

import {
  getStudentTeams,
  getTeamByAssignment,
  getTeamMembers,
} from "../../controllers/student/studentTeamController";
import { protectStudent } from "../../middleware/studentAuthMiddleware";
import { protectAnyUser } from "../../middleware/authAnyUserMiddleware";

const router = Router();

//////////////////////
/// STUDENT ROUTES ///
//////////////////////

// Haal alle teams op waarin de ingelogde student zit
/**
 * @route GET /team/student
 * @description Get all teams of the logged in student
 * @access Student
 */
router.get("/student", protectStudent, getStudentTeams);

// Haal een specifiek team op aan de hand van assignmentId
/**
 * @route GET /team/assignment/:assignmentId/studentTeam
 * @description Get a specific team by assignmentId
 * @param assignmentId: number
 * @access Student
 */
router.get(
  "/assignment/:assignmentId/studentTeam",
  protectStudent,
  getTeamByAssignment
);

// Haal alle teamleden op van een specifiek team
/**
 * @route GET /team/:teamId/members
 * @description Get all team members of a specific team
 * @param teamId: number
 * @access Teacher/Student
 */
router.get("/:teamId/members", protectAnyUser, getTeamMembers);

//////////////////////
/// TEACHER ROUTES ///
//////////////////////

// Prefix voor deze routes:
// "/teacher/assignments/:assignmentId/team"

/**
 * @route POST /team/class/:classId/assignment/:assignmentId
 * @description Create teams in an assignment
 * @param classId: number
 * @param assignmentId: number
 * @access Teacher
 */
router.post(
  "/class/:classId/assignment/:assignmentId",
  protectTeacher,
  makeAssignmentIdParamValid,
  ensureTeamsParamValidTeamDivision,
  createTeamInAssignment
);

/**
 * @route GET /team/assignment/:assignmentId/all
 * @description Get all teams in an assignment
 * @param assignmentId: number
 * @access Teacher
 */
router.get(
  "/assignment/:assignmentId/all",
  protectTeacher,
  makeAssignmentIdParamValid,
  getTeamsInAssignment
);

/**
 * @route PATCH /team/assignments/:assignmentId
 * @description Update teams in an assignment
 * @param assignmentId: number
 * @body teams: Team[]
 * @access Teacher
 */
router.patch(
  "/assignment/:assignmentId",
  protectTeacher,
  makeAssignmentIdParamValid,
  ensureTeamParamValidIdentifiableTeamDivision,
  updateTeamsInAssignment
);

/**
 * @route DELETE /team/:teamId/assignment/:assignmentId
 * @description Delete a team in an assignment
 * @param teamId: number
 * @param assignmentId: number
 * @access Teacher
 */
router.delete(
  "/:teamId/assignment/:assignmentId",
  protectTeacher,
  makeTeamIdParamValid,
  deleteTeamInAssignment
);

export default router;
