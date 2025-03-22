import express, { Router } from "express";
import {
  searchLearningPathsController,
  getLearningPathByIdController,
} from "../../controllers/learningPath/learningPathController";
import { protectAnyUser } from "../../middleware/authAnyUserMiddleware";
import { getLearningObjectByHruidLangVersionController } from "../../controllers/learningObject/learningObjectController";

const router: Router = express.Router();

// Bescherm alle endpoints zodat een user (met role) aanwezig is.
// Kan zowel een student als een teacher zijn.
router.use(protectAnyUser);

/**
 * @route GET /teacher/learningPath?language=nl&hruid=...&title=...&description=...&all=
 * @route GET /student/learningPath?language=nl&hruid=...&title=...&description=...&all=
 * @description Zoek naar leerpaden op basis van de query parameters
 * @queryparam language: string
 * @queryparam hruid: string
 * @queryparam title: string
 * @queryparam description: string
 * @queryparam all: string
 * @access User
 */
router.get("/", searchLearningPathsController);

/**
 * @route GET /teacher/learningPath/:pathId
 * @route GET /student/learningPath/:pathId
 * @description Haal 1 leerpad op (op basis van _id of hruid)
 * @param pathId: string
 * @access User
 */
router.get("/:pathId", getLearningPathByIdController);

/**
 * @route GET /teacher/learningPath/:pathId/learningObject
 * @route GET /student/learningPath/:pathId/learningObject
 * @description Haal alle leerobjecten op die horen bij een specifiek leerpad
 * @param pathId: string
 * @queryparam language: string
 * @queryparam hruid: string
 * @queryparam version: int
 * @access User
 */
router.get("/learningObject", getLearningObjectByHruidLangVersionController);

export default router;
