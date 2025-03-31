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

const router = Router();
router.use(protectTeacher);

//////////////////////
/// TEACHER ROUTES ///
//////////////////////

/**
 * @route POST /team/teacher/class/:classId/assignment/:assignmentId
 * @description Create teams in an assignment
 * @param classId: number
 * @param assignmentId: number
 * @access Teacher
 */
router.post(
  "/class/:classId/assignment/:assignmentId",
  makeAssignmentIdParamValid,
  ensureTeamsParamValidTeamDivision,
  createTeamInAssignment,
);

/**
 * @route GET /team/teacher/assignment/:assignmentId/all
 * @description Get all teams in an assignment
 * @param assignmentId: number
 * @access Teacher
 */
router.get(
  "/assignment/:assignmentId/all",
  makeAssignmentIdParamValid,
  getTeamsInAssignment,
);

/**
 * @route PATCH /team/teacher/assignments/:assignmentId
 * @description Update teams in an assignment
 * @param assignmentId: number
 * @body teams: Team[]
 * @access Teacher
 */
router.patch(
  "/assignment/:assignmentId",
  makeAssignmentIdParamValid,
  ensureTeamParamValidIdentifiableTeamDivision,
  updateTeamsInAssignment,
);

/**
 * @route DELETE /team/teacher/:teamId/assignment/:assignmentId
 * @description Delete a team in an assignment
 * @param teamId: number
 * @param assignmentId: number
 * @access Teacher
 */
router.delete(
  "/:teamId/assignment/:assignmentId",
  makeTeamIdParamValid,
  deleteTeamInAssignment,
);

export default router;
