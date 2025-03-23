import express from "express";
import {
  createInvite,
  getPendingInvitesForClass,
  getPendingInvitesForTeacher,
  updateInviteStatus,
  deleteInvite,
} from "../../controllers/teacher/inviteController";
import {
  getJoinRequestsByClass,
  updateJoinRequestStatus,
} from "../../controllers/joinrequest/joinRequestController";
import { validateRequest } from "../../middleware/validateRequest";
import {
  createInviteBodySchema,
  createInviteParamsSchema,
  deleteInviteParamsSchema,
  getClassInvitesParamsSchema,
  updateInviteBodySchema,
  updateInviteParamsSchema,
} from "../../zodSchemas/inviteSchemas";
import { protectTeacher } from "../../middleware/teacherAuthMiddleware";

const router = express.Router();

router.use(protectTeacher);

// routes for invites

/**
 * @route GET /invite
 * @description Get all pending invites for a teacher
 * @access Teacher
 */
router.get("/", getPendingInvitesForTeacher);

/**
 * @route POST /invite/class/:classId
 * @description Create an invite for a class
 * @body otherTeacherId: number
 * @param classId: number
 * @access Teacher
 */
router.post(
  "/class/:classId",
  validateRequest(
    "invalid request for invite creation",
    createInviteBodySchema,
    createInviteParamsSchema
  ),
  createInvite
);

/**
 * @route GET /invite/class/:classId
 * @description Get all pending invites for a class
 * @param classId: number
 * @access Teacher
 */
router.get(
  "/class/:classId",
  validateRequest(
    "invalid request params",
    undefined,
    getClassInvitesParamsSchema
  ),
  getPendingInvitesForClass
);

/**
 * @route PATCH /invite/:inviteId
 * @description Update an invite
 * @body action: string {"accept", "decline"}
 * @param inviteId: number
 * @access Teacher
 */
router.patch(
  "/:inviteId",
  validateRequest(
    "invalid request for invite update",
    updateInviteBodySchema,
    updateInviteParamsSchema
  ),
  updateInviteStatus
);

/**
 * @route DELETE /invite/:inviteId/class/:classId
 * @description Delete an invite
 * @param inviteId: number
 * @param classId: number
 * @access Teacher
 */
router.delete(
  ":inviteId/class/:classId",
  validateRequest(
    "invalid request params",
    undefined,
    deleteInviteParamsSchema
  ),
  deleteInvite
);

// routes for join requests
router.get("/:classId/join-requests", getJoinRequestsByClass);
router.patch("/:classId/join-requests/:requestId", updateJoinRequestStatus);

export default router;
