import express, { Router } from "express";
import {
  createProgress,
  getStudentProgress,
  updateProgress,
  getTeamProgressStudent,
  getStudentAssignmentProgress,
  getTeamProgressTeacher,
  getAssignmentAverageProgress,
} from "../controllers/progressController";
import { protectStudent } from "../middleware/studentAuthMiddleware";
import { protectTeacher } from "../middleware/teacherAuthMiddleware";

const router: Router = express.Router();

/**
 * ===========================
 *          STUDENT
 * ===========================
 */

/**
 * @route   POST /progress/student/:learningObjectId
 * @desc    Een nieuwe progressie aanmaken voor een student bij een leerobject.
 *          Dit wordt gebruikt wanneer een student een nieuw leerobject start.
 * @access  Beveiligd (alleen studenten kunnen dit)
 */
router.post("/student/:learningObjectId", protectStudent, createProgress);

/**
 * @route   GET /progress/student/:learningObjectId
 * @desc    Haal de huidige progressie op van een student voor een specifiek leerobject.
 *          Dit toont of de student het leerobject heeft voltooid of niet.
 * @access  Beveiligd (alleen studenten kunnen dit)
 */
router.get("/student/:learningObjectId", protectStudent, getStudentProgress);

/**
 * @route   PATCH /progress/student/:learningObjectId
 * @desc    Werk de progressie van een student bij voor een leerobject.
 *          Bijvoorbeeld: markeer een leerobject als voltooid.
 * @access  Beveiligd (alleen studenten kunnen dit)
 */
router.patch("/student/:learningObjectId", protectStudent, updateProgress);

/**
 * @route   GET /progress/student/:teamid
 * @desc    Haal de voortgang van een team op voor een specifieke opdracht.
 *          Dit betekent dat je de progressie van alle teamleden bekijkt en bepaalt
 *          wat de verste vooruitgang is die iemand binnen het team heeft bereikt. 
 *          Geeft een percentage terug van het het verste dat iemand binnen een team is geraakt.
 *          Je rekent het percentage uit van het verste leerobject dat is bereikt binnen het leerpad van alle leerobjecten binnen dat leerpad
 * @access  Beveiligd (alleen studenten kunnen dit)
 */
router.get("/student/:teamid", protectStudent, getTeamProgressStudent);

/**
 * @route   GET /progress/student/assignment/:assignmentId
 * @desc    Haal de voortgang op van de student bij een specifieke opdracht.
 *          Dit toont hoe ver de student zelf is gekomen in het leerpad van deze opdracht.
 *          Geeft een percentage terug van hoeveel leerobjecten binnen het leerpad de student heeft voltooid.
 * @access  Beveiligd (alleen studenten kunnen dit)
 */
router.get("/student/assignment/:assignmentId", protectStudent, getStudentAssignmentProgress);

/**
 * @route   PATCH /progress/student/:learningPathId
 * @desc    Haal de voortgang op van de student bij een specifieke leerpad.
 *          Dit toont hoe ver de student zelf is gekomen in het leerpad.
 *          Geeft een percentage terug van hoeveel leerobjecten binnen het leerpad de student heeft voltooid.
 * @access  Beveiligd (alleen studenten kunnen dit)
 */
router.get("/student/:learningPathId/", protectStudent, getStudentLearningPathProgress);
/**
 * ===========================
 *          TEACHER
 * ===========================
 */

/**
 * @route   GET /progress/teacher/:teamid
 * @desc    Haal de voortgang van een team op voor een specifieke opdracht.
 *          Dit betekent dat je de progressie van alle teamleden bekijkt en bepaalt
 *          wat de verste vooruitgang is die iemand binnen het team heeft bereikt. 
 *          Geeft een percentage terug van het het verste dat iemand binnen een team is geraakt.
 *          Je rekent het percentage uit van het verste leerobject dat is bereikt binnen het leerpad van alle leerobjecten binnen dat leerpad
 * @access  Beveiligd (alleen docenten kunnen dit)
 */
router.get("/teacher/:teamid", protectTeacher, getTeamProgressTeacher);

/**
 * @route   GET /progress/teacher/:assignmentId/average
 * @desc    Bereken de gemiddelde voortgang van een klas bij een opdracht.
 *          De verste vooruitgang van elk team of student wordt verzameld en
 *          er wordt een gemiddelde berekend.
 * @access  Beveiligd (alleen docenten kunnen dit)
 */
router.get("/teacher/:assignmentId/average", protectTeacher, getAssignmentAverageProgress);

export default router;
