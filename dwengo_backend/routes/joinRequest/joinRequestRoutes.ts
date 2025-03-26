import {
  getJoinRequestsByClass,
  updateJoinRequestStatus,
} from "../../controllers/joinrequest/joinRequestController";
import express from "express";
import { protectTeacher } from "../../middleware/teacherAuthMiddleware";

const router = express.Router();

router.use(protectTeacher);

// routes for join requests

/**
 * @route GET /join-request/class/:classId
 * @description Get all join requests for a class
 * @param classId: number
 * @access Teacher
 */
router.get("/class/:classId", getJoinRequestsByClass);

/**
 * @route PATCH /join-request/:requestId/class/:classId
 * @description Update the status of a join request
 * @param requestId: number
 * @param classId: number
 * @body action: string {approve, deny}
 * @access Teacher
 */
router.patch("/:requestId/class/:classId", updateJoinRequestStatus);

export default router;
