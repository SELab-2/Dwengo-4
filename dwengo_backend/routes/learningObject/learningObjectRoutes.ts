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
 * GET /teacher/learningObject
 * GET /student/learningObject
 *   -> haal alle leerobjecten op
 */
router.get("/", getAllLearningObjectsController);

/**
 * GET /teacher/learningObject/search
 * GET /student/learningObject/search
 *   -> zoek leerobject met bepaalde parameters
 */
router.get("/search", searchLearningObjectsController);
// [NIEUW] Extra endpoint om op hruid+language+version te zoeken
// Voorbeeld:
//   GET /learningObjects/lookup?hruid=opdracht_leds&language=nl&version=2
router.get("/lookup", getLearningObjectByHruidLangVersionController);

/**
 * GET /teacher/learningObject/:learningObjectId
 * GET /student/learningObject/:learningObjectId
 *   -> haal bepaald leerobject op
 */
router.get("/:learningObjectId", getLearningObjectController);

export default router;
