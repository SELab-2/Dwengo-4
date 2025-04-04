import express, { Router } from "express";
import { AssignmentTeacherController } from "../../controllers/teacher/teacherAssignmentController";
import { protectTeacher } from "../../middleware/authMiddleware/teacherAuthMiddleware";

const router: Router = express.Router();
const controller = new AssignmentTeacherController();

router.use(protectTeacher);

/**
 * @route GET /assignment/teacher
 * @description Get all assignments that the teacher has created
 * @access Teacher
 */
router.get("/", controller.getAllAssignments);

/**
 * @route POST /assignment/teacher
 * @description Create an assignment for a class
 * @body classId: number
 * @body pathRef: string
 * @body pathLanguage: string
 * @body isExternal: boolean
 * @body deadline: string
 * @access Teacher
 */
router.post("/", controller.createAssignmentForClass);

/**
 * @route GET /assignment/teacher/class/:classId
 * @description Get all assignments for a class
 * @param classId: number
 * @access Teacher
 */
router.get("/class/:classId", controller.getAssignmentsByClass);

/**
 * @route PATCH /assignment/teacher/:assignmentId
 * @description Update an assignment
 * @param pathRef: string (optional)
 * @param pathLanguage: string (optional)
 * @param isExternal: boolean
 * @param deadline: string
 * @access Teacher
 */
router.patch("/:assignmentId", controller.updateAssignment);

/**
 * @route DELETE /assignment/teacher/:assignmentId
 * @description Delete an assignment
 * @param assignmentId: number
 * @access Teacher
 */
router.delete("/:assignmentId", controller.deleteAssignment);

export default router;
