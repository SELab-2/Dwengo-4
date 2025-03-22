import express from "express";
import {
  getAllLearningObjectsController,
  getLearningObjectController,
  searchLearningObjectsController,
  // [NIEUW] importeer de extra controller-functie:
  getLearningObjectByHruidLangVersionController,
} from "../../controllers/learningObject/learningObjectController";
import { protectAnyUser } from "../../middleware/authAnyUserMiddleware";

const router = express.Router();

// Bescherm alle endpoints, user moet ingelogd zijn (student/teacher/admin)
router.use(protectAnyUser);

router.get("/", getAllLearningObjectsController);
router.get("/search", searchLearningObjectsController);
// [NIEUW] Extra endpoint om op hruid+language+version te zoeken
// Voorbeeld:
//   GET /learningObjects/lookup?hruid=opdracht_leds&language=nl&version=2
router.get("/lookup", getLearningObjectByHruidLangVersionController);

router.get("/:id", getLearningObjectController);

/**
 * @route GET /learningObject/learningPath/:pathId
 * @description Haal alle leerobjecten op die horen bij een specifiek leerpad
 * @param pathId: string
 * @queryparam language: string
 * @queryparam hruid: string
 * @queryparam version: int
 * @access User
 */
router.get(
  "/learningPath/learningPathId",
  getLearningObjectByHruidLangVersionController
);

export default router;
