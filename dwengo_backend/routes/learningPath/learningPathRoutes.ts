
import express, { Router } from "express";
import {
  searchLearningPathsController,
  getLearningPathByIdController,
} from "../../controllers/learningPath/learningPathController";
import { protectAnyUser } from "../../middleware/authAnyUserMiddleware";

const router: Router = express.Router();

// We zetten de route achter 'protectAnyUser' (of wat je wilt)
router.use(protectAnyUser);

/**
 * @route GET /learningPath
 * @description Zoekt leerpaden (Dwengo + lokaal)
 */
router.get("/", searchLearningPathsController);

/**
 * @route GET /learningPath/:pathId
 * @description Haal 1 leerpad op, Dwengo of lokaal
 */
router.get("/:pathId", getLearningPathByIdController);

export default router;
