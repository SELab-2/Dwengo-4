import express, { Router } from "express";
import {
  createInvite,
  deleteInvite,
  getPendingInvitesForClass,
  getPendingInvitesForTeacher,
  updateInviteStatus,
} from "../../controllers/teacher/inviteController";

import { validateRequest } from "../../middleware/validateRequest";
import { protectTeacher } from "../../middleware/authMiddleware/teacherAuthMiddleware";
import {
  classAndInviteIdParamsSchema,
  classIdParamsSchema,
  inviteActionBodySchema,
  inviteIdParamsSchema,
  otherTeacherEmailBodySchema,
} from "../../zodSchemas";

const router: Router = express.Router();

router.use(protectTeacher);

// routes for invites

/**
 * @route GET /invite
 * @description Get all pending invites for a teacher
 */
router.get("/", getPendingInvitesForTeacher);

/**
 * @route POST /invite/class/:classId
 * @description Create an invitation for a class
 * @body otherTeacherId: number
 * @param classId: number
 */
router.post(
  "/class/:classId",
  validateRequest({
    customErrorMessage: "invalid request for invite creation",
    bodySchema: otherTeacherEmailBodySchema,
    paramsSchema: classIdParamsSchem,
  }),
  createInvite,
);

/**
 * @route GET /invite/class/:classId
 * @description Get all pending invites for a class
 * @param classId: number
 */
router.get(
  "/class/:classId",
  validateRequest({
    customErrorMessage: "invalid request params",
    paramsSchema: classIdParamsSchema,
  }),
  getPendingInvitesForClass,
);

/**
 * @route PATCH /invite/:inviteId
 * @description Update an invitation
 * @body action: string {"accept", "decline"}
 * @param inviteId: number
 */
router.patch(
  "/:inviteId",
  validateRequest({
    customErrorMessage: "invalid request for invite update",
    bodySchema: inviteActionBodySchema,
    paramsSchema: inviteIdParamsSchem,
  }),
  updateInviteStatus,
);

/**
 * @route DELETE /invite/:inviteId/class/:classId
 * @description Delete an invitation
 * @param inviteId: number
 * @param classId: number
 */
router.delete(
  "/:inviteId/class/:classId",
  validateRequest({
    customErrorMessage: "invalid request params",
    paramsSchema: classAndInviteIdParamsSchema,
  }),
  deleteInvite,
);

export default router;
