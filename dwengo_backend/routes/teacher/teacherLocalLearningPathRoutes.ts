import { Router } from "express";
import { protectTeacher } from "../../middleware/teacherAuthMiddleware";
import {
  createLocalLearningPath,
  getLocalLearningPaths,
  getLocalLearningPathById,
  updateLocalLearningPath,
  deleteLocalLearningPath,
} from "../../controllers/teacher/teacherLocalLearningPathController";
import { getAllLearningPaths, getLearningPathById } from "../../controllers/teacher/teacherLearningPathController";

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
 * GET /teacher/learningPaths/all
 *   -> haalt alle leerpaden op (zowel van de teacher als van de API)
 */
router.get("/all", getAllLearningPaths);

/**
 * GET /teacher/learningPaths/search
 *   -> zoek leerpaden op basis van een query
 */
router.get("/all/:pathId", getLearningPathById);

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
