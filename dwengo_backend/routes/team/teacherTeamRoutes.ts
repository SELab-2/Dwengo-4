import { Router } from "express";

import {
  createTeamInAssignment,
  deleteTeamInAssignment,
  getTeamsInAssignment,
  updateTeamsInAssignment,
} from "../../controllers/teacher/teacherTeamsController";
import { protectTeacher } from "../../middleware/authMiddleware/teacherAuthMiddleware";
import { validateRequest } from "../../middleware/validateRequest";
import {
  assignmentIdParamsSchema,
  classAndAssignmentIdParamsSchema,
  teamIdParamsSchema,
} from "../../zodSchemas/idSchemas";
import {
  identifiableTeamsBodySchema,
  teamsBodySchema,
} from "../../zodSchemas/bodySchemas";

const router: Router = Router();
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
  validateRequest({
    customErrorMessage: "invalid request for creating teams",
    paramsSchema: classAndAssignmentIdParamsSchema,
    bodySchema: teamsBodySchema,
  }),
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
  validateRequest({
    customErrorMessage: "invalid request for getting teams",
    paramsSchema: assignmentIdParamsSchema,
  }),
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
  validateRequest({
    paramsSchema: assignmentIdParamsSchema,
    bodySchema: identifiableTeamsBodySchema,
  }),
  updateTeamsInAssignment,
);

/**
 * @route DELETE /team/teacher/:teamId/assignment/:assignmentId
 * @description Delete a team in an assignment
 * @param teamId: number
 * @param assignmentId: number
 * @access Teacher
 */
// TODO: Deze route heeft geen /assignment/:assignmentId nodig?
router.delete(
  "/:teamId/assignment/:assignmentId",
  validateRequest({
    customErrorMessage: "invalid request for deleting a team",
    paramsSchema: teamIdParamsSchema,
  }),
  deleteTeamInAssignment,
);

export default router;
