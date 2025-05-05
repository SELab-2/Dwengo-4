import { Router } from "express";
import {
  getNodesForPath,
  updateNodeForPath,
  deleteNodeFromPath,
  updateAllNodesForPath,
} from "../../controllers/teacher/teacherLocalLearningPathNodesController";
import { protectAnyUser } from "../../middleware/authMiddleware/authAnyUserMiddleware";
import { protectTeacher } from "../../middleware/authMiddleware/teacherAuthMiddleware";

// Enable merging of route parameters from parent routes
const router = Router({ mergeParams: true });

/**
 * @route GET /learningPath/:learningPathId/node
 * @description Haal alle nodes op voor dat leerpad
 * @param learningPathId: string
 * @access User
 */
router.get("/", protectAnyUser, getNodesForPath);

/**
 * @route PATCH /learningPath/:learningPathId/node/:nodeId
 * @description Update de node
 * @param pathId: string
 * @param nodeId: string
 * @body NodeMetadata
 * @access Teacher
 */
router.patch("/:nodeId", protectTeacher, updateNodeForPath);

/**
 * @route DELETE /learningPath/:learningPathId/node/:nodeId
 * @description Verwijder de node
 * @param pathId: string
 * @param nodeId: string
 * @access Teacher
 */
router.delete("/:nodeId", protectTeacher, deleteNodeFromPath);

/**
 * @route POST /learningPath/:learningPathId/node
 * @description updates (or creates) all nodes in the learning path
 * @param pathId: string
 * @body NodeMetadata[]: ordered list of nodes
 * -> can contain existing (re-ordered) nodes and new nodes, nodes not present in the list will be deleted
 * @access Teacher
 */
router.post("/", protectTeacher, updateAllNodesForPath);

export default router;
