import express from 'express';
import { protectTeacher } from '../../middleware/teacherAuthMiddleware';
import {
  createClassroom,
  deleteClassroom,
  getJoinLink,
  regenerateJoinLink,
  getClassroomStudents,
} from '../../controllers/teacher/teacherClassController';
import { 
  createInvite,
  getPendingInvitesForClass,
  getPendingInvitesForTeacher,
  updateInviteStatus,
  deleteInvite
} from '../../controllers/teacher/inviteController';
import { 
  getJoinRequestsByClass,
  updateJoinRequestStatus
} from '../../controllers/joinrequest/joinRequestController';

const router = express.Router();

// Alleen leerkrachten mogen deze routes gebruiken
router.use(protectTeacher);

// routes for classes
router.post("/", createClassroom);
router.delete("/:classId", deleteClassroom);
router.get("/:classId/join-link", getJoinLink);
router.patch("/:classId/regenerate-join-link", regenerateJoinLink);
router.get("/:classId/students", getClassroomStudents);

// routes for invites
router.post("/:classId/invites", createInvite);
router.get("/:classId/invites", getPendingInvitesForClass);
router.delete("/:classId/invites/:inviteId", deleteInvite);
router.get("/invites", getPendingInvitesForTeacher);
router.patch("/invites/:inviteId", updateInviteStatus);

// routes for join requests
router.get("/:classId/join-requests", getJoinRequestsByClass);
router.patch("/:classId/join-requests/:requestId", updateJoinRequestStatus);

export default router;
