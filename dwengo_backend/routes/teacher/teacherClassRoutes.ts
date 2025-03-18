import express from "express";
import { protectTeacher } from "../../middleware/teacherAuthMiddleware";
import express from "express";
import { protectTeacher } from "../../middleware/teacherAuthMiddleware";
import {
<<<<<<< HEAD
    createClassroom,
    deleteClassroom,
    getJoinLink,
    regenerateJoinLink,
    getClassroomStudents,
    getTeacherClasses
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
=======
  createClassroom,
  deleteClassroom,
  getJoinLink,
  regenerateJoinLink,
  getClassroomStudents,
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
<<<<<<< HEAD
  updateJoinRequestStatus
} from '../../controllers/joinrequest/joinRequestController';
>>>>>>> f28556a (teacher invite op email)
=======
  updateJoinRequestStatus,
} from "../../controllers/joinrequest/joinRequestController";
<<<<<<< HEAD
>>>>>>> 048bf9e (get classes for students and teachers)
=======
import { validateRequest } from "../../middleware/validateRequest";
import {
  createInviteBodySchema,
  createInviteParamsSchema,
  deleteInviteParamsSchema,
  getClassInvitesParamsSchema,
  updateInviteBodySchema,
  updateInviteParamsSchema,
} from "../../zodSchemas/inviteSchemas";
>>>>>>> b9274c4 (request validation for invite creation)

const router = express.Router();

// Alleen leerkrachten mogen deze routes gebruiken
router.use(protectTeacher);

// routes for classes
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> 048bf9e (get classes for students and teachers)
router.get("/", getTeacherClasses);
router.post("/", createClassroom);
router.delete("/:classId", deleteClassroom);
router.get("/:classId/join-link", getJoinLink);
router.patch("/:classId/regenerate-join-link", regenerateJoinLink);
router.get("/:classId/students", getClassroomStudents);
<<<<<<< HEAD
=======
router.post("/", protectTeacher, createClassroom);
router.get("/", protectTeacher, getClassrooms);
router.delete("/:classId", protectTeacher, deleteClassroom);
router.get("/:classId/join-link", protectTeacher, getJoinLink);
router.patch("/:classId/regenerate-join-link", protectTeacher, regenerateJoinLink);
router.get("/:classId/students", protectTeacher, getClassroomStudents);
>>>>>>> f28556a (teacher invite op email)

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
    validateRequest("invalid request params", undefined, getClassInvitesParamsSchema),
    getPendingInvitesForClass
);
router.delete(
    "/:classId/invites/:inviteId",
    validateRequest("invalid request params", undefined, deleteInviteParamsSchema),
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
=======

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
<<<<<<< HEAD
router.patch("/invites/:inviteId", updateInviteStatus);
>>>>>>> 048bf9e (get classes for students and teachers)
=======
>>>>>>> da44f98 (add request validation for other invite routes + tests)

// routes for join requests
router.get("/:classId/join-requests", getJoinRequestsByClass);
router.patch("/:classId/join-requests/:requestId", updateJoinRequestStatus);

export default router;
