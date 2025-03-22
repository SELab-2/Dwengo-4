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

// GET /teacher/learningPath?language=nl&hruid=...&title=...&description=...&all=
// GET /student/learningPath?language=nl&hruid=...&title=...&description=...&all=
router.get("/", searchLearningPathsController);

// GET /teacher/learningPath/:pathId
// GET /student/learningPath/:pathId
router.get("/:pathId", getLearningPathByIdController);

// GET /teacher/learningPath/:pathId/learningObject --> Haal alle leerobjecten op die horen bij een specifiek leerpad
// GET /student/learningPath/:pathId/learningObject
router.get("/learningObject", getLearningObjectByHruidLangVersionController);

export default router;
