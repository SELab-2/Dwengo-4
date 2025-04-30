import {
  createJoinRequest,
  getJoinRequestsByClass,
  updateJoinRequestStatus,
} from "../../controllers/joinrequest/joinRequestController";
import express, { Router } from "express";
import { protectTeacher } from "../../middleware/authMiddleware/teacherAuthMiddleware";
import { protectStudent } from "../../middleware/authMiddleware/studentAuthMiddleware";
import { validateRequest } from "../../middleware/validateRequest";
import {
  classAndRequestIdParamsSchema,
  classIdParamsSchema,
} from "../../zodSchemas/idSchemas";
import { joinRequestBodySchema } from "../../zodSchemas/actionSchemas";

const router: Router = express.Router();

// routes for join requests

/**
 * @route GET /join-request/teacher/class/:classId
 * @description Get all join requests for a class
 * @param classId: number
 * @access Teacher
 */
router.get(
  "/teacher/class/:classId",
  protectTeacher,
  validateRequest({
    customErrorMessage: "invalid classId request parameter",
    paramsSchema: classIdParamsSchema,
  }),
  getJoinRequestsByClass,
);

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
  validateRequest({
    customErrorMessage: "invalid request params",
    paramsSchema: classAndRequestIdParamsSchema,
    bodySchema: joinRequestBodySchema,
  }),
  updateJoinRequestStatus,
);

export default router;
