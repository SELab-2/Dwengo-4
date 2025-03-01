import * as express from "express";
import * as joinRequestController from "../../controllers/joinrequest/joinRequestController"
import { isTeacher } from "../../middleware/teacherAuthMiddleware"

const router = express.Router();

router.post("/", joinRequestController.createJoinRequest);
router.patch("//:classId/approve/:studentId", isTeacher, joinRequestController.approveJoinRequest);
router.patch("//:classId/deny/:studentId", isTeacher, joinRequestController.denyJoinRequest);
router.get("/class/:classId", isTeacher, joinRequestController.getJoinRequestsByClass);

export default router;
