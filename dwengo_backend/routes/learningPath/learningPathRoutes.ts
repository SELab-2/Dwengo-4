import express, { Router } from "express";
import { z } from "zod";
import { searchLearningPathsController } from "../../controllers/learningPath/learningPathController";
import { protectAnyUser } from "../../middleware/authMiddleware/authAnyUserMiddleware";
import { validateRequest } from "../../middleware/validateRequest";
import { pathIdSchema } from "../../zodSchemas";

const router: Router = express.Router();

// Middleware voor Auth
router.use(protectAnyUser);

// Schema voor zoek- en includeProgress query-parameters
const learningPathQuerySchema = z.object({
  language: z.string().optional(),
  hruid: z.string().optional(),
  title: z.string().optional(),
  description: z.string().optional(),
  all: z.string().optional(),
  includeProgress: z.string().optional()
});

/**
 * @route GET /learningPath
 * @description Zoekt leerpaden (Dwengo + lokaal)
 */
router.get(
  "/",
  validateRequest({
    querySchema: learningPathQuerySchema,
  }),
  searchLearningPathsController,
);

/**
 * @route GET /learningPath/:pathId
 * @description Haal 1 leerpad op, Dwengo of lokaal
 */
router.get(
  "/:pathId",
  validateRequest({
    customErrorMessage: "invalid pathId request parameter",
    paramsSchema: pathIdSchema,
    querySchema: z.object({ includeProgress: z.string().optional() ),
  }),
  getLearningPathByIdControllr,
);

export default router;
