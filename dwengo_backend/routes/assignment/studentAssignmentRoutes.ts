import express, { Router } from "express";
import {
  getStudentAssignments,
  getStudentAssignmentsInClass,
} from "../../controllers/student/studentAssignmentController";
import { protectStudent } from "../../middleware/studentAuthMiddleware";

const router: Router = express.Router();

/**
 * @route GET /assignment/student
 * @description Get all assignments for a student
 * @queryparam sort: string {asc, desc}
 * @queryparam order: string {createdAt, updatedAt, deadline}
 * @queryparam limit: number
 * @access Student
 */
router.get("/", protectStudent, getStudentAssignments);

/**
 * @route GET /assignment/student/class/:classId
 * @description Get all assignments for a student in a class
 * @param classId: number
 * @queryparam sort: string {asc, desc}
 * @queryparam order: string {createdAt, updatedAt, deadline}
 * @queryparam limit: number
 * @access Student
 */
router.get("/class/:classId", protectStudent, getStudentAssignmentsInClass);

export default router;
