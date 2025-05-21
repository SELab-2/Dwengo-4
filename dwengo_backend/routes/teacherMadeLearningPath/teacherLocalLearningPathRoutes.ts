import { Router } from "express";
import { protectTeacher } from "../../middleware/authMiddleware/teacherAuthMiddleware";
import {
  createLocalLearningPath,
  deleteLocalLearningPath,
  deleteAllLocalLearningPaths,
  getLocalLearningPathById,
  getLocalLearningPaths,
  updateLocalLearningPath,
} from "../../controllers/teacher/teacherLocalLearningPathController";
import {
  getAllLearningPaths,
  getLearningPathById,
} from "../../controllers/teacher/teacherLearningPathController";
import { validateRequest } from "../../middleware/validateRequest";
import {
  createLocalLearningPathSchema,
  updateLocalLearningPathSchema,
} from "../../zodSchemas/body/localLearningPathSchemas";

const router: Router = Router();

// Zorg dat alleen ingelogde gebruikers (teachers/admin) toegang hebben
router.use(protectTeacher);

/**
 * @route POST /pathByTeacher
 * @description Maak een nieuw leerpad aan
 * @body LocalLearningPathData
 * @access Teacher
 */
router.post(
  "/",
  validateRequest({
    customErrorMessage: "invalid request for creating a learning path",
    bodySchema: createLocalLearningPathSchema,
  }),
  createLocalLearningPath,
);

/**
 * @route GET /pathByTeacher
 * @description Haal alle leerpaden op van de ingelogde teacher
 * @access Teacher
 */
router.get("/", getLocalLearningPaths);

/**
 * @route GET /pathByTeacher/all
 * @description Haal alle leerpaden op (zowel van de teacher als van de API)
 * @access Teacher
 */
router.get("/all", getAllLearningPaths);

/**
 * @route GET /pathByTeacher/all/:pathId
 * @description Haal één leerpad op (van teacher of API)
 * @param pathId: string
 * @access Teacher
 */
router.get("/all/:pathId", getLearningPathById);

/**
 * GET /teacher/learningPaths/:pathId
 *   -> haal één leerpad op (mits je eigenaar bent)
 * @route GET /pathByTeacher/:pathId
 * @description Haal één leerpad op (mits je eigenaar bent)
 * @param pathId: string
 * @access Teacher
 */
router.get("/:pathId", getLocalLearningPathById);

/**
 * @route PATCH /pathByTeacher/:pathId
 * @description Update een leerpad
 * @param pathId: string
 * @body LocalLearningPathData
 * @access Teacher
 */
router.patch(
  "/:pathId",
  validateRequest({
    customErrorMessage: "invalid request for updating a learning path",
    bodySchema: updateLocalLearningPathSchema,
  }),
  updateLocalLearningPath,
);

/**
 * @route DELETE /pathByTeacher/:pathId
 * @description Verwijder een leerpad
 * @param pathId: string
 * @access Teacher
 */
router.delete("/:pathId", deleteLocalLearningPath);




/**
 * @route DELETE /pathByTeacher/
 * @description Verwijder een leerpad
 * @param pathId: string
 * @access Teacher
 */
router.delete("/", deleteAllLocalLearningPaths);




export default router;
