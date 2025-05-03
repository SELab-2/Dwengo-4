import express from "express";
import {
  getAllLearningObjectsController,
  getLearningObjectController,
  searchLearningObjectsController,
  // [NIEUW] importeer de extra controller-functie:
  getLearningObjectByHruidLangVersionController,
  getLearningObjectsForPathController,
} from "../../controllers/learningObject/learningObjectController";
import { protectAnyUser } from "../../middleware/authMiddleware/authAnyUserMiddleware";
import { protectTeacher } from "../../middleware/authMiddleware/teacherAuthMiddleware";

const router = express.Router();

/**
 * @route GET /learningObject/teacher
 * @description Haal alle leerobjecten op. Enkel leerkrachten kunnen dit doen.
 * @access Teacher
 */
router.get("/teacher", protectTeacher, getAllLearningObjectsController);

/**
 * @route GET /learningObject/teacher/search
 * @description Zoek leerobject met bepaalde parameters
 * @query q: string (zoekterm)
 * @access Teacher
 */
router.get("/teacher/search", protectTeacher, searchLearningObjectsController);

/**
 * @route GET /learningObject/teacher/lookup/:hruid/:language/:version
 * @description Haal leerobject op met hruid+language+version
 * @param hruid: string (hruid van leerobject)
 * @param language: string (taal van leerobject)
 * @param version: number (versie van leerobject)
 * @access Teacher
 */
router.get(
  "/teacher/lookup/:hruid/:language/:version",
  protectTeacher,
  getLearningObjectByHruidLangVersionController,
);

/**
 * @route GET /learningObject/:learningObjectId
 * @description Haal bepaald leerobject op
 * @param learningObjectId: string
 * @access Teacher/Student
 * DON'T USE THIS ROUTE: SINCE THE DWENGO API DOESN'T IMPLEMENT SEARCHING BY ID CORRECTLY,
 * THIS ROUTE ONLY CHECKS LOCAL LEARNING OBJECTS. (it's kept in in case the Dwengo API is fixed in the future)
 */
router.get("/:learningObjectId", protectAnyUser, getLearningObjectController);

/**
 * @route GET /learningObject/learningPath/:learningPathId
 * @description Haal alle leerobjecten op die horen bij een specifiek leerpad
 * @param learningPathId: string
 * @access Teacher/Student
 */
router.get(
  "/learningPath/:learningPathId",
  protectAnyUser,
  getLearningObjectsForPathController,
);

export default router;
