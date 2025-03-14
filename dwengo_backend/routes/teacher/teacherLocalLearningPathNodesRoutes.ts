import { Router } from "express";
import { protectAnyUser } from "../../middleware/authAnyUserMiddleware";
import {
  getNodesForPath,
  createNodeForPath,
  updateNodeForPath,
  deleteNodeFromPath,
} from "../../controllers/teacher/teacherLocalLearningPathNodesController";

const router = Router();
router.use(protectAnyUser);

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
 * PUT /teacher/learningPaths/:pathId/nodes/:nodeId
 *   -> update de node
 */
router.put("/:pathId/nodes/:nodeId", updateNodeForPath);

/**
 * DELETE /teacher/learningPaths/:pathId/nodes/:nodeId
 *   -> verwijder de node
 */
router.delete("/:pathId/nodes/:nodeId", deleteNodeFromPath);

export default router;
