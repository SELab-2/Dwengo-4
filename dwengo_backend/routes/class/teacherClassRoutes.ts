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

// routes for classes

/**
 * @route POST /class
 * @description Create a classroom
 * @body name: string
 * @access Teacher
 */
router.post("/", protectTeacher, createClassroom);

/**
 * @route GET /class/teacher
 * @description Get all classes for a teacher
 * @access Teacher
 */
router.get("/teacher", protectTeacher, getTeacherClasses);

/**
 * @route GET /class/:classId
 * @description Get all students in a classroom
 * @param classId: string
 * @access Teacher
 */
router.get("/:classId", protectTeacher, getClassroomStudents);

/**
 * @route DELETE /class/:classId
 * @description Delete a classroom
 * @param classId: string
 * @access Teacher
 */
router.delete("/:classId", protectTeacher, deleteClassroom);

/**
 * @route GET /class/:classId/join-link
 * @description Get the join link for a classroom
 * @param classId: string
 * @access Teacher
 */
router.get("/:classId/join-link", protectTeacher, getJoinLink);

/**
 * @route PATCH /class/:classId/join-link
 * @description Regenerate the join link for a classroom
 * @param classId: string
 * @access Teacher
 */
router.patch("/:classId/join-link", protectTeacher, regenerateJoinLink);

export default router;
