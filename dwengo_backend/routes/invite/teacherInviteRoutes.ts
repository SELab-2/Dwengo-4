import express, { Router } from "express";
import {
  createInvite,
  getPendingInvitesForClass,
  getPendingInvitesForTeacher,
  updateInviteStatus,
  deleteInvite,
} from "../../controllers/teacher/inviteController";

import { validateRequest } from "../../middleware/validateRequest";
import {
  createInviteBodySchema,
  createInviteParamsSchema,
  deleteInviteParamsSchema,
  getClassInvitesParamsSchema,
  updateInviteBodySchema,
  updateInviteParamsSchema,
} from "../../zodSchemas/inviteSchemas";
import { protectTeacher } from "../../middleware/authMiddleware/teacherAuthMiddleware";

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
    bodySchema: createInviteBodySchema,
    paramsSchema: createInviteParamsSchema,
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
    paramsSchema: getClassInvitesParamsSchema,
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
    bodySchema: updateInviteBodySchema,
    paramsSchema: updateInviteParamsSchema,
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
    paramsSchema: deleteInviteParamsSchema,
  }),
  deleteInvite,
);

export default router;
