import express, { Router } from "express";
import { AssignmentTeacherController } from "../../controllers/teacher/teacherAssignmentController";
import { protectTeacher } from "../../middleware/teacherAuthMiddleware";
import { AssignmentController } from "../../controllers/assignmentController";

const router: Router = express.Router();
const controller = new AssignmentTeacherController();
const assignmentController = new AssignmentController();

/**
 * @route POST /teacher/assignment
 * @description Create an assignment for a class
 * @body classId: number
 * @body pathRef: string
 * @body pathLanguage: string
 * @body isExternal: boolean
 * @body deadline: string
 * @access Teacher
 */
router.post("/", protectTeacher, controller.createAssignmentForClass);

/**
 * @route GET /teacher/assignment/:assignmentId
 * @description Get an assignment by id
 * @param assignmentId: number
 * @access Anyone (Should be checked if user is teacher is teacher of this class)
 */
router.get("/:assignmentId", assignmentController.getAssignmentsById);

/**
 * @route GET /teacher/assignment/class/:classId
 * @description Get all assignments for a class
 * @param classId: number
 * @access Teacher
 */
router.get("/class/:classId", protectTeacher, controller.getAssignmentsByClass);

/**
 * @route PATCH /teacher/assignment/:assignmentId
 * @description Update an assignment
 * @param pathRef: string (optional)
 * @param pathLanguage: string (optional)
 * @param isExternal: boolean
 * @param deadline: string
 * @access Teacher
 */
router.patch("/:assignmentId", protectTeacher, controller.updateAssignment);

/**
 * @route DELETE /teacher/assignment/:assignmentId
 * @description Delete an assignment
 * @param assignmentId: number
 * @access Teacher
 */
router.delete("/:assignmentId", protectTeacher, controller.deleteAssignment);

export default router;
