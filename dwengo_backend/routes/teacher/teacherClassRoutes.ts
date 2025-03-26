import express from "express";
import { protectTeacher } from "../../middleware/teacherAuthMiddleware";
import {
  createClassroom,
  deleteClassroom,
  getJoinLink,
  regenerateJoinLink,
  getClassroomStudents,
  getAllClassrooms,
  getClassByIdAndTeacherId,
} from "../../controllers/teacher/teacherClassController";
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
const router = express.Router();

// Alleen leerkrachten mogen deze routes gebruiken
router.use(protectTeacher);

// routes for classes
router.get("/", protectTeacher, getAllClassrooms);
router.post("/", protectTeacher, createClassroom);
router.delete("/:classId", protectTeacher, deleteClassroom);
router.get("/:classId", protectTeacher, getClassByIdAndTeacherId);
router.get("/:classId/join-link", protectTeacher, getJoinLink);
router.post(
  "/:classId/regenerate-join-link",
  protectTeacher,
  regenerateJoinLink
);
router.get("/:classId/students", protectTeacher, getClassroomStudents);

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
router.patch("/invites/:inviteId", updateInviteStatus);

// routes for join requests
router.get("/:classId/join-requests", getJoinRequestsByClass);
router.patch("/:classId/join-requests/:requestId", updateJoinRequestStatus);

export default router;
