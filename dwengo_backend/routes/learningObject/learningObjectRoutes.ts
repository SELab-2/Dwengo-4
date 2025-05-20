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
import {
  learningObjectIdSchema,
  learningObjectParamsSchema,
  learningPathIdSchema,
} from "../../zodSchemas";
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
 * @route GET /learningObject/teacher/lookup/:hruid/:language/:version
 * @description Haal leerobject op met hruid+language+version
 * @param hruid: string (hruid van leerobject)
 * @param language: string (taal van leerobject)
 * @param version: number (versie van leerobject)
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
 * DON'T USE THIS ROUTE: SINCE THE DWENGO API DOESN'T IMPLEMENT SEARCHING BY ID CORRECTLY,
 * THIS ROUTE ONLY CHECKS LOCAL LEARNING OBJECTS. (it's kept in in case the Dwengo API is fixed in the future)
 */
router.get(
  "/:learningObjectId",
  protectAnyUser,
  validateRequest({
    customErrorMessage: "invalid learningObjectId request parameter",
    paramsSchema: learningObjectIdSchema,
  }),
  getLearningObjectController,
);

/**
 * @route GET /learningObject/learningPath/:learningPathId
 * @description Haal alle leerobjecten op die horen bij een specifiek leerpad
 * @param learningPathId: string
 * @access Teacher/Student
 */
router.get(
  "/learningPath/:learningPathId",
  protectAnyUser,
  validateRequest({
    customErrorMessage: "invalid learningPathId request parameter",
    paramsSchema: learningPathIdSchema,
  }),
  getLearningObjectsForPathController,
);

export default router;
