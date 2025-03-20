import express, { Router } from "express";
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

const router: Router = express.Router();

// Prefix voor deze routes:
// "/teacher/assignments/:assignmentId/team"

// Route to create teams in an assignment
router.post(
  "/class/:classId",
  protectTeacher,
  makeAssignmentIdParamValid,
  ensureTeamsParamValidTeamDivision,
  createTeamInAssignment
);

// Route to get all teams in an assignment
router.get(
  "/",
  protectTeacher,
  makeAssignmentIdParamValid,
  getTeamsInAssignment
);

// Route to update teams in an assignment
router.patch(
  "/",
  protectTeacher,
  makeAssignmentIdParamValid,
  ensureTeamParamValidIdentifiableTeamDivision,
  updateTeamsInAssignment
);

// Route to delete a team in an assignment
router.delete(
  "/:teamId",
  protectTeacher,
  makeTeamIdParamValid,
  deleteTeamInAssignment
);

export default router;
