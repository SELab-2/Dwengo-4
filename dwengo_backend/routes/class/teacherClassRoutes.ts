import express from "express";
import {
  createClassroom,
  deleteClassroom,
  getClassroomStudents,
  getJoinLink,
  getTeacherClasses,
  regenerateJoinLink,
  getClassByIdAndTeacherId,
} from "../../controllers/teacher/teacherClassController";
import { protectTeacher } from "../../middleware/authMiddleware/teacherAuthMiddleware";

const router = express.Router();
router.use(protectTeacher);

// routes for classes

/**
 * @route POST /class/teacher
 * @description Create a classroom
 * @body name: string
 * @access Teacher
 */
router.post("/", createClassroom);

/**
 * @route GET /class/teacher
 * @description Get all classes for a teacher
 * @access Teacher
 */
router.get("/", getTeacherClasses);

/**
 * @route GET /class/teacher/:classId/student
 * @description Get all students in a classroom
 * @param classId: number
 * @access Teacher
 */
router.get("/:classId/student", getClassroomStudents);

/**
 * @route GET /class/teacher/:classId/join-link
 * @description Get the join link for a classroom
 * @param classId: string
 * @access Teacher
 */
router.get("/:classId/join-link", getJoinLink);

/**
 * @route PATCH /class/teacher/:classId/join-link
 * @description Regenerate the join link for a classroom
 * @param classId: string
 * @access Teacher
 */
router.patch("/:classId/join-link", regenerateJoinLink);

/**
 * @route GET /class/teacher/:classId
 * @description Get a classroom by ID
 * @param classId: string
 * @access Teacher
 */
router.get("/:classId", getClassByIdAndTeacherId);

/**
 * @route DELETE /class/teacher/:classId
 * @description Delete a classroom
 * @param classId: string
 * @access Teacher
 */
router.delete("/:classId", deleteClassroom);

export default router;
