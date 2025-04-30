import express, { Router } from "express";
import {
  getAllLearningObjectsController,
  getLearningObjectByHruidLangVersionController,
  getLearningObjectController,
  getLearningObjectsForPathController,
  searchLearningObjectsController,
} from "../../controllers/learningObject/learningObjectController";
import { protectAnyUser } from "../../middleware/authMiddleware/authAnyUserMiddleware";
import { protectTeacher } from "../../middleware/authMiddleware/teacherAuthMiddleware";
import { learningObjectParamsSchema } from "../../zodSchemas/paramSchemas";
import { validateRequest } from "../../middleware/validateRequest";

const router: Router = express.Router();

/**
 * @route GET /learningObject/teacher
 * @description Haal alle leerobjecten op. Enkel leerkrachten kunnen dit doen.
 * @access Teacher
 */
router.get("/teacher", protectTeacher, getAllLearningObjectsController);

/**
 * @route GET /learningObject/teacher/search
 * @description Zoek leerobject met bepaalde parameters
 * @query q: string (zoekterm)
 * @access Teacher
 */
router.get("/teacher/search", protectTeacher, searchLearningObjectsController);

/**
 * @route GET /learningObject/teacher/lookup
 * @description Haal leerobject op met hruid+language+version
 * @query hruid: string (hruid van leerobject)
 * @query language: string (taal van leerobject)
 * @query version: number (versie van leerobject)
 * @access Teacher
 */
router.get(
  "/teacher/lookup/:hruid/:language/:version",
  protectTeacher,
  validateRequest({
    customErrorMessage: "Invalid parameters for getting learning object.",
    paramsSchema: learningObjectParamsSchema,
  }),
  getLearningObjectByHruidLangVersionController,
);

/**
 * @route GET /learningObject/:learningObjectId
 * @description Haal bepaald leerobject op
 * @param learningObjectId: string
 * @access Teacher/Student
 */
router.get("/:learningObjectId", protectAnyUser, getLearningObjectController);

/**
 * @route GET /learningObject/learningPath/:learningPathId
 * @description Haal alle leerobjecten op die horen bij een specifiek leerpad
 * @param pathId: string
 * @queryparam language: string
 * @queryparam hruid: string
 * @queryparam version: int
 * @access Teacher/Student
 */
router.get(
  "/learningPath/:learningPathId",
  protectAnyUser,
  getLearningObjectsForPathController,
);

export default router;
