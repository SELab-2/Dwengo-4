import {
  createJoinRequest,
  getJoinRequestsByClass,
  updateJoinRequestStatus,
} from "../../controllers/joinrequest/joinRequestController";
import express from "express";
import { protectTeacher } from "../../middleware/teacherAuthMiddleware";
import { protectStudent } from "../../middleware/studentAuthMiddleware";

const router = express.Router();

// routes for join requests

/**
 * @route GET /join-request/teacher/class/:classId
 * @description Get all join requests for a class
 * @param classId: number
 * @access Teacher
 */
router.get("/teacher/class/:classId", protectTeacher, getJoinRequestsByClass);

/**
 * @route POST /join-request/student
 * @description Create a join request to join a class
 * @body joinCode: string
 * @access Student
 */
router.post("/student", protectStudent, createJoinRequest);

/**
 * @route PATCH /join-request/teacher/:requestId/class/:classId
 * @description Update the status of a join request
 * @param requestId: number
 * @param classId: number
 * @body action: string {approve, deny}
 * @access Teacher
 */
router.patch(
  "/teacher/:requestId/class/:classId",
  protectTeacher,
  updateJoinRequestStatus
);

export default router;
