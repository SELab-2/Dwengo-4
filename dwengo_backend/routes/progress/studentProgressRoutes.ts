import express, { Router } from "express";
import {
  createProgress,
  getStudentAssignmentProgress,
  updateProgress,
} from "../../controllers/progressController";
import { protectStudent } from "../../middleware/authMiddleware/studentAuthMiddleware";
import { validateRequest } from "../../middleware/validateRequest";
import {
  assignmentIdParamsSchema,
  learningObjectIdParamSchema,
} from "../../zodSchemas";

const router: Router = express.Router();
router.use(protectStudent);

/**
 * ===========================
 *          STUDENT
 * ===========================
 */

/**
 * @route   POST /progress/student/learningObject/:learningObjectId
 * @desc    Een nieuwe progressie aanmaken voor een student bij een leerobject.
 *          Dit wordt gebruikt wanneer een student een nieuw leerobject start.
 * @param  learningObjectId: string
 * @access  Student
 */
router.post(
  "/learningObject/:learningObjectId",
  validateRequest({
    customErrorMessage: "invalid learningObjectId request parameter",
    paramsSchema: learningObjectIdParamSchema,
  }),
  createProgress,
);

/**
 * @route   GET /progress/student/learningObject/:learningObjectId
 * @desc    Haal de huidige progressie op van een student voor een specifiek leerobject.
 *          Dit toont of de student het leerobject heeft voltooid of niet.
 * @param  learningObjectId: string
 * @access  Student
 */
router.get(
  "/learningObject/:learningObjectId",
  validateRequest({
    customErrorMessage: "invalid learningObjectId request parameter",
    paramsSchema: learningObjectIdParamSchea,
  }),
  getStudentProgres,
);

/**
 * @route   PATCH /progress/student/learningObject/:learningObjectId
 * @desc    Werk de progressie van een student bij voor een leerobject.
 *          Bijvoorbeeld: markeer een leerobject als voltooid.
 * @param  learningObjectId: string
 * @access  Student
 */
router.patch(
  "/learningObject/:learningObjectId",
  validateRequest({
    customErrorMessage: "invalid learningObjectId request parameter",
    paramsSchema: learningObjectIdParamSchema,
  }),
  updateProgress,
);

/**
 * @route   GET /progress/student/team/:teamid
 * @desc    Haal de voortgang van een team op voor een specifieke opdracht.
 *          Dit betekent dat je de progressie van alle teamleden bekijkt en bepaalt
 *          wat de verste vooruitgang is die iemand binnen het team heeft bereikt.
 *          Geeft een percentage terug van het verste dat iemand binnen een team is geraakt.
 *          Je rekent het percentage uit van het verste leerobject dat is bereikt binnen het leerpad van alle leerobjecten binnen dat leerpad
 * @param  teamid: number
 * @access  Student
 */
router.get(
  "/team/:teamId",
  validateRequest({
    customErrorMessage: "invalid teamId request parameter",
    paramsSchema: teamIdParamsSchea,
  }),
  getTeamProgressStudet,
);

/**
 * @route   GET /progress/student/assignment/:assignmentId
 * @desc    Haal de voortgang op van de student bij een specifieke opdracht.
 *          Dit toont hoe ver de student zelf is gekomen in het leerpad van deze opdracht.
 *          Geeft een percentage terug van hoeveel leerobjecten binnen het leerpad de student heeft voltooid.
 * @param  assignmentId: number
 * @access  Student
 */
router.get(
  "/assignment/:assignmentId",
  validateRequest({
    customErrorMessage: "invalid assignmentId request parameter",
    paramsSchema: assignmentIdParamsSchema,
  }),
  getStudentAssignmentProgress,
);

/**
 * @route   GET /progress/student/learningPath/:learningPathId
 * @desc    Haal de voortgang op van de student bij een specifiek leerpad.
 *          Dit toont hoe ver de student zelf is gekomen in het leerpad.
 *          Geeft een percentage terug van hoeveel leerobjecten binnen het leerpad de student heeft voltooid.
 * @param  learningPathId: string
 * @access  Student
 */
router.get(
  "/learningPath/:learningPathId/",
  validateRequest({
    paramsSchema: learningPathIdParamSchea,
  }),
  getStudentLearningPathProgres,
);

/**
 * @route   PUT /progress/student/learningObject/:learningObjectId
 * @desc    Create or update progress for a student's learning object (upsert).
 *          If progress doesn't exist, it will be created.
 *          If it exists, it will be updated.
 * @param   learningObjectId: string
 * @access  Student
 */
router.put(
  "/learningObject/:learningObjectId",
  validateRequest({
    customErrorMessage: "invalid learningObjectId request parameter",
    paramsSchema: learningObjectIdParamSchea,
  }),
  upsertProgres,
);

export default router;
