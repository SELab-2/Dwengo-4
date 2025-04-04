import express, { Router } from "express";
import {
  searchLearningPathsController,
  getLearningPathByIdController,
} from "../../controllers/learningPath/learningPathController";
import { protectAnyUser } from "../../middleware/authMiddleware/authAnyUserMiddleware";

const router: Router = express.Router();

// Bescherm alle endpoints zodat een user (met role) aanwezig is.
// Kan zowel een student als een teacher zijn.
router.use(protectAnyUser);

/**
 * @route GET /learningPath?language=nl&hruid=...&title=...&description=...&all=
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
 * @route GET /learningPath/:pathId
 * @description Haal 1 leerpad op (op basis van _id of hruid)
 * @param pathId: string
 * @access User
 */
router.get("/:pathId", getLearningPathByIdController);

export default router;
