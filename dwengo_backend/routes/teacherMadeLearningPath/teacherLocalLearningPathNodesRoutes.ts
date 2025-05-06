import { Router } from "express";
import {
  getNodesForPath,
  updateNodeForPath,
  deleteNodeFromPath,
  createNodeForPath,
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
 * @route POST /learningPath/:learningPathId/node
 * @description Maak een nieuwe node in dit leerpad
 * @param pathId: string
 * @body NodeMetadata
 * @access Teacher
 */
router.post("/", protectTeacher, createNodeForPath);

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

export default router;
