import { Router } from "express";
import { protectTeacher } from "../../middleware/teacherAuthMiddleware";
import {
  getNodesForPath,
  createNodeForPath,
  updateNodeForPath,
  deleteNodeFromPath,
} from "../../controllers/teacher/teacherLocalLearningPathNodesController";

const router = Router();
router.use(protectTeacher);

/**
 * GET /teacher/learningPaths/:pathId/node
 *   -> haal alle nodes op voor dat leerpad
 */
router.get("/", getNodesForPath);

/**
 * POST /teacher/learningPaths/:pathId/node
 *   -> maak een nieuwe node in dit leerpad
 */
router.post("/", createNodeForPath);

/**
 * PATCH /teacher/learningPath/:pathId/node/:nodeId
 *   -> update de node
 */
router.patch("/:nodeId", updateNodeForPath);

/**
 * DELETE /teacher/learningPath/:pathId/node/:nodeId
 *   -> verwijder de node
 */
router.delete("/:nodeId", deleteNodeFromPath);

export default router;
