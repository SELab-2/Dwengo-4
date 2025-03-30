import { Router } from "express";
import { protectTeacher } from "../../middleware/teacherAuthMiddleware";
import {
  createLocalLearningPath,
  getLocalLearningPaths,
  getLocalLearningPathById,
  updateLocalLearningPath,
  deleteLocalLearningPath,
} from "../../controllers/teacher/teacherLocalLearningPathController";

const router = Router();

// Zorg dat alleen ingelogde gebruikers (teachers/admin) toegang hebben
router.use(protectTeacher);

/**
 * @route POST /pathByTeacher
 * @description Maak een nieuw leerpad aan (standaard zonder nodes)
 * @body PathMetadata
 * @access Teacher
 */
router.post("/", createLocalLearningPath);

/**
 * @route GET /pathByTeacher
 * @description Haal alle leerpaden op van de ingelogde teacher
 * @access Teacher
 */
router.get("/", getLocalLearningPaths);

/**
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
 * @body PathMetadata
 * @access Teacher
 */
router.patch("/:pathId", updateLocalLearningPath);

/**
 * @route DELETE /pathByTeacher/:pathId
 * @description Verwijder een leerpad
 * @param pathId: string
 * @access Teacher
 */
router.delete("/:pathId", deleteLocalLearningPath);

export default router;
