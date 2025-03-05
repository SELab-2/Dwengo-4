import express from 'express';
import { protectTeacher } from '../../middleware/teacherAuthMiddleware';
import {
  createClassroom,
  deleteClassroom,
  getJoinLink,
  regenerateJoinLink,
  getClassroomStudents,
} from '../../controllers/teacher/teacherClassController';
import { createInvite, getPendingInvitesForTeacher, updateInviteStatus, deleteInvite } from '../../controllers/teacher/inviteController';

const router = express.Router();

// Alleen leerkrachten mogen deze routes gebruiken
router.post("/", protectTeacher, createClassroom);
router.delete("/:classId", protectTeacher, deleteClassroom);
router.get("/:classId/join-link", protectTeacher, getJoinLink);
router.post("/:classId/regenerate-join-link", protectTeacher, regenerateJoinLink);
router.get("/:classId/students", protectTeacher, getClassroomStudents);

// routes for invites
router.post("/:classId/invite", protectTeacher, createInvite);
router.get("/invites", protectTeacher, getPendingInvitesForTeacher);
router.patch("/:classId/invite", protectTeacher, updateInviteStatus);
router.delete("/:classId/invite/:teacherId", protectTeacher, deleteInvite);

export default router;
