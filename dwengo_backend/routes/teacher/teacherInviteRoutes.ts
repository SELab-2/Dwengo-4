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
router.post(
  "/:classId/invites",
  validateRequest(
    "invalid request for invite creation",
    createInviteBodySchema,
    createInviteParamsSchema
  ),
  createInvite
);
router.get(
  "/:classId/invites",
  validateRequest(
    "invalid request params",
    undefined,
    getClassInvitesParamsSchema
  ),
  getPendingInvitesForClass
);
router.delete(
  "/:classId/invites/:inviteId",
  validateRequest(
    "invalid request params",
    undefined,
    deleteInviteParamsSchema
  ),
  deleteInvite
);
router.patch(
  "/invites/:inviteId",
  validateRequest(
    "invalid request for invite update",
    updateInviteBodySchema,
    updateInviteParamsSchema
  ),
  updateInviteStatus
);
router.get("/invites", getPendingInvitesForTeacher);

// routes for join requests
router.get("/:classId/join-requests", getJoinRequestsByClass);
router.patch("/:classId/join-requests/:requestId", updateJoinRequestStatus);

export default router;
