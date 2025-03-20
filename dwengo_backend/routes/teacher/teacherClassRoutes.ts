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
router.post("/", protectTeacher, createClassroom);
router.delete("/:classId", protectTeacher, deleteClassroom);
router.get("/:classId/join-link", protectTeacher, getJoinLink);
router.patch("/:classId/regenerate-join-link", protectTeacher, regenerateJoinLink);
router.get("/:classId/students", protectTeacher, getClassroomStudents);

// routes for invites
router.post("/:classId/invites", protectTeacher, createInvite);
router.get("/:classId/invites", protectTeacher, getPendingInvitesForClass);
router.delete("/:classId/invites/:inviteId", protectTeacher, deleteInvite);
router.get("/invites", protectTeacher, getPendingInvitesForTeacher);
router.patch("/invites/:inviteId", protectTeacher, updateInviteStatus);

// routes for join requests
router.get("/:classId/join-requests", protectTeacher, getJoinRequestsByClass);
router.patch("/:classId/join-requests/:requestId", protectTeacher, updateJoinRequestStatus);

export default router;
