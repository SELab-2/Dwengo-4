import express from "express";
import {
  createClassroom,
  deleteClassroom,
  getClassroomStudents,
  getJoinLink,
  getTeacherClasses,
  regenerateJoinLink,
} from "../../controllers/teacher/teacherClassController";
import { protectTeacher } from "../../middleware/teacherAuthMiddleware";

const router = express.Router();

// Alleen leerkrachten mogen deze routes gebruiken
router.use(protectTeacher);

// routes for classes
router.get("/teacher", getTeacherClasses);
router.post("/", createClassroom);
router.delete("/:classId", deleteClassroom);
router.get("/:classId/join-link", getJoinLink);
router.patch("/:classId/join-link", regenerateJoinLink);
router.get("/:classId", getClassroomStudents);

export default router;
