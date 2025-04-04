import { Router } from "express";
import { protectTeacher } from "../../middleware/authMiddleware/teacherAuthMiddleware";
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
 * POST /teacher/learningPaths
 *   -> maak een nieuw leerpad aan (standaard zonder nodes)
 */
router.post("/", createLocalLearningPath);

/**
 * GET /teacher/learningPaths
 *   -> haal alle leerpaden op van de ingelogde teacher
 */
router.get("/", getLocalLearningPaths);

/**
 * GET /teacher/learningPaths/:pathId
 *   -> haal één leerpad op (mits je eigenaar bent)
 */
router.get("/:pathId", getLocalLearningPathById);

/**
 * PATCH /teacher/learningPaths/:pathId
 *   -> update een leerpad
 */
router.patch("/:pathId", updateLocalLearningPath);

/**
 * DELETE /teacher/learningPaths/:pathId
 *   -> verwijder een leerpad
 */
router.delete("/:pathId", deleteLocalLearningPath);

export default router;
