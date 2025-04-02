import express, { Router } from "express";
import {
  searchLearningPathsController,
  getLearningPathByIdController,
} from "../../controllers/learningPath/learningPathController";
import { protectAnyUser } from "../../middleware/authMiddleware/authAnyUserMiddleware";

const router: Router = express.Router();

// Bescherm alle endpoints zodat een user (met role) aanwezig is.
router.use(protectAnyUser);

// GET /learningPaths?language=nl&hruid=...&title=...&description=...&all=
router.get("/", searchLearningPathsController);

// GET /learningPaths/:pathId
router.get("/:pathId", getLearningPathByIdController);

export default router;
