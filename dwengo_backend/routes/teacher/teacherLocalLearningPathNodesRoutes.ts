import { Router } from "express";
import { protectTeacher } from "../../middleware/authMiddleware/teacherAuthMiddleware";
import {
  getNodesForPath,
  createNodeForPath,
  updateNodeForPath,
  deleteNodeFromPath,
} from "../../controllers/teacher/teacherLocalLearningPathNodesController";

const router = Router();
router.use(protectTeacher);

/**
 * GET /teacher/learningPaths/:pathId/nodes
 *   -> haal alle nodes op voor dat leerpad
 */
router.get("/:pathId/nodes", getNodesForPath);

/**
 * POST /teacher/learningPaths/:pathId/nodes
 *   -> maak een nieuwe node in dit leerpad
 */
router.post("/:pathId/nodes", createNodeForPath);

/**
 * PATCH /teacher/learningPaths/:pathId/nodes/:nodeId
 *   -> update de node
 */
router.patch("/:pathId/nodes/:nodeId", updateNodeForPath);

/**
 * DELETE /teacher/learningPaths/:pathId/nodes/:nodeId
 *   -> verwijder de node
 */
router.delete("/:pathId/nodes/:nodeId", deleteNodeFromPath);

export default router;
