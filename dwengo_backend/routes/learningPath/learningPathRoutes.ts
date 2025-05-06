import express, { Router } from "express";
import {
  getLearningPathByIdController,
  searchLearningPathsController,
} from "../../controllers/learningPath/learningPathController";
import { protectAnyUser } from "../../middleware/authMiddleware/authAnyUserMiddleware";
import { validateRequest } from "../../middleware/validateRequest";
import { pathIdSchema } from "../../zodSchemas";

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
router.get(
  "/:pathId",
  validateRequest({
    customErrorMessage: "invalid pathId request parameter",
    paramsSchema: pathIdSchema,
  }),
  getLearningPathByIdController,
);

export default router;
