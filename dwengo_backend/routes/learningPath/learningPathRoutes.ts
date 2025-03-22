import express, { Router } from "express";
import {
  searchLearningPathsController,
  getLearningPathByIdController,
} from "../../controllers/learningPath/learningPathController";
import { protectAnyUser } from "../../middleware/authAnyUserMiddleware";

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

export default router;
