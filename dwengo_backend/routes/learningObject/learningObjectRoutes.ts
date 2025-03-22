import express from "express";
import {
  getAllLearningObjectsController,
  getLearningObjectController,
  searchLearningObjectsController,
  getLearningObjectsForPathController,
  // [NIEUW] importeer de extra controller-functie:
  getLearningObjectByHruidLangVersionController,
} from "../../controllers/learningObject/learningObjectController";
import { protectAnyUser } from "../../middleware/authAnyUserMiddleware";

const router = express.Router();

// Bescherm alle endpoints, user moet ingelogd zijn (student/teacher/admin)
router.use(protectAnyUser);

/**
 * @route GET /teacher/learningObject
 * @route GET /student/learningObject
 * @description Haal alle leerobjecten op
 * @access Teacher/Student
 */
router.get("/", getAllLearningObjectsController);

/**
 * @route GET /teacher/learningObject/search
 * @route GET /student/learningObject/search
 * @description Zoek leerobject met bepaalde parameters
 * @query q: string (zoekterm)
 * @access Teacher/Student
 */
router.get("/search", searchLearningObjectsController);

/**
 * @route GET /teacher/learningObject/lookup
 * @route GET /student/learningObject/lookup
 * @description Haal leerobject op met hruid+language+version
 * @query hruid: string (hruid van leerobject)
 * @query language: string (taal van leerobject)
 * @query version: number (versie van leerobject)
 * @access Teacher/Student
 */
router.get("/lookup", getLearningObjectByHruidLangVersionController);

/**
 * @route GET /teacher/learningObject/:learningObjectId
 * @route GET /student/learningObject/:learningObjectId
 * @description Haal bepaald leerobject op
 * @param learningObjectId: string
 * @access Teacher/Student
 */
router.get("/:learningObjectId", getLearningObjectController);

export default router;
