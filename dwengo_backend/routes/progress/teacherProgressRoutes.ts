import express, { Router } from "express";
import {
  getAssignmentAverageProgress,
  getTeamProgressTeacher,
} from "../../controllers/progressController";
import { protectTeacher } from "../../middleware/authMiddleware/teacherAuthMiddleware";
import { assignmentIdParamsSchema, teamIdParamsSchema } from "../../zodSchemas";
import { validateRequest } from "../../middleware/validateRequest";

const router: Router = express.Router();

/**
 * ===========================
 *          TEACHER
 * ===========================
 */

/**
 * @route   GET /progress/teacher/team/:teamid
 * @desc    Haal de voortgang van een team op voor een specifieke opdracht.
 *          Dit betekent dat je de progressie van alle teamleden bekijkt en bepaalt
 *          wat de verste vooruitgang is die iemand binnen het team heeft bereikt.
 *          Geeft een percentage terug van het verste dat iemand binnen een team is geraakt.
 *          Je rekent het percentage uit van het verste leerobject dat is bereikt binnen het leerpad van alle leerobjecten binnen dat leerpad
 * @param  teamid: number
 * @access  Teacher
 */
router.get(
  "/team/:teamId",
  protectTeacher,
  validateRequest({
    customErrorMessage: "invalid teamId request parameter",
    paramsSchema: teamIdParamsSchema,
  }),
  getTeamProgressTeacher,
);

/**
 * @route   GET /progress/teacher/assignment/:assignmentId/average
 * @desc    Bereken de gemiddelde voortgang van een klas bij een opdracht.
 *          De verste vooruitgang van elk team of student wordt verzameld en
 *          er wordt een gemiddelde berekend.
 * @param  assignmentId: number
 * @access  Teacher
 */
router.get(
  "/assignment/:assignmentId/average",
  protectTeacher,
  validateRequest({
    customErrorMessage: "invalid assignmentId request parameter",
    paramsSchema: assignmentIdParamsSchea,
  }),
  getAssignmentAverageProgress,
);

export default router;
