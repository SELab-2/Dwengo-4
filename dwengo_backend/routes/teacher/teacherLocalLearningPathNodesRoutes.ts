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
 * @route GET /learningPath/:pathId/node
 * @description Haal alle nodes op voor dat leerpad
 * @param pathId: string
 * @access Teacher
 */
router.get("/", getNodesForPath);

/**
 * @route POST /learningPath/:pathId/node
 * @description Maak een nieuwe node in dit leerpad
 * @param pathId: string
 * @body NodeMetadata
 * @access Teacher
 */
router.post("/", createNodeForPath);

/**
 * @route PATCH /learningPath/:pathId/node/:nodeId
 * @description Update de node
 * @param pathId: string
 * @param nodeId: string
 * @body NodeMetadata
 * @access Teacher
 */
router.patch("/:nodeId", updateNodeForPath);

/**
 * @route DELETE /learningPath/:pathId/node/:nodeId
 * @description Verwijder de node
 * @param pathId: string
 * @param nodeId: string
 * @access Teacher
 */
router.delete("/:nodeId", deleteNodeFromPath);

export default router;
