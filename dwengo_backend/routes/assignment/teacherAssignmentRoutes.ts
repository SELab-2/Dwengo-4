import express, { Router } from "express";
import { AssignmentTeacherController } from "../../controllers/teacher/teacherAssignmentController";
import { protectTeacher } from "../../middleware/authMiddleware/teacherAuthMiddleware";
import { validateRequest } from "../../middleware/validateRequest";
import {
  assignmentIdParamsSchema,
  classIdParamsSchema,
  optionalLimitQuerySchema,
} from "../../zodSchemas";

const router: Router = express.Router();
const controller = new AssignmentTeacherController();

router.use(protectTeacher);

/**
 * @route GET /assignment/teacher
 * @description Get all assignments that the teacher has created
 * @access Teacher
 */
router.get(
  "/",
  validateRequest({
    customErrorMessage: "invalid request for teacher assignments",
    querySchema: optionalLimitQuerySchema,
  }),
  controller.getAllAssignments,
);

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
 * @route POST /assignment/teacher/team
 * @description Create an assignment with teams for a class
 * @body pathRef: string
 * @body pathLanguage: string
 * @body isExternal: boolean
 * @body deadline: string
 * @body title: string
 * @body description: string
 * @body teamSize: number
 * @access Teacher
 */
router.post("/team", controller.createAssignmentWithTeams);

/**
 * @route PATCH /assignment/teacher/team/:assignmentId
 * @description Update a team assignment
 * @param assignmentId: number
 * @body teamSize: number
 * @access Teacher
 */
router.patch(
  "/team/:assignmentId",
  validateRequest({
    customErrorMessage: "invalid request for updating assignment with teams",
    paramsSchema: assignmentIdParamsSchema,
  }),
  controller.updateAssignmentWithTeams,
);

/**
 * @route GET /assignment/teacher/class/:classId
 * @description Get all assignments for a class
 * @param classId: number
 * @access Teacher
 */
router.get(
  "/class/:classId",
  validateRequest({
    customErrorMessage: "invalid request for teacher assignments",
    paramsSchema: classIdParamsSchema,
  }),
  controller.getAssignmentsByClass,
);

/**
 * @route PATCH /assignment/teacher/team/:assignmentId
 * @description Update a team assignment
 * @param assignmentId: number
 * @body teamSize: number
 * @access Teacher
 */
router.patch(
  "/team/:assignmentId",
  validateRequest({
    customErrorMessage: "invalid request for updating assignment with teams",
    paramsSchema: assignmentIdParamsSchema,
  }),
  controller.updateAssignmentWithTeams,
);

/**
 * @route PATCH /assignment/teacher/:assignmentId
 * @description Update an assignment
 * @param pathRef: string (optional)
 * @param pathLanguage: string (optional)
 * @param isExternal: boolean
 * @param deadline: string
 * @access Teacher
 */
router.patch(
  "/:assignmentId",
  validateRequest({
    customErrorMessage: "invalid request for updating assignment",
    paramsSchema: assignmentIdParamsSchema,
  }),
  controller.updateAssignment,
);

/**
 * @route DELETE /assignment/teacher/:assignmentId
 * @description Delete an assignment
 * @param assignmentId: number
 * @access Teacher
 */
router.delete(
  "/:assignmentId",
  validateRequest({
    customErrorMessage: "invalid request for deleting assignment",
    paramsSchema: assignmentIdParamsSchema,
  }),
  controller.deleteAssignment,
);

export default router;
