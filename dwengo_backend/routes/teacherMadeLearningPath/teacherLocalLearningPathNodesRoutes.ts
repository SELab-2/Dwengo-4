import { Router } from "express";
import {
  createNodeForPath,
  deleteNodeFromPath,
  getNodesForPath,
  updateNodeForPath,
} from "../../controllers/teacher/teacherLocalLearningPathNodesController";
import { protectAnyUser } from "../../middleware/authMiddleware/authAnyUserMiddleware";
import { protectTeacher } from "../../middleware/authMiddleware/teacherAuthMiddleware";
import { validateRequest } from "../../middleware/validateRequest";
import {
  learningPathIdSchema,
  nodeAndLearningPathIdSchema,
  nodeMetadataSchema,
} from "../../zodSchemas";

// Enable merging of route parameters from parent routes
const router: Router = Router({ mergeParams: true });

/**
 * @route GET /learningPath/:learningPathId/node
 * @description Haal alle nodes op voor dat leerpad
 * @param learningPathId: string
 * @access User
 */
router.get(
  "/",
  protectAnyUser,
  validateRequest({
    customErrorMessage: "invalid learningPathId request parameter",
    paramsSchema: learningPathIdSchema,
  }),
  getNodesForPath,
);

/**
 * @route POST /learningPath/:learningPathId/node
 * @description Maak een nieuwe node in dit leerpad
 * @param pathId: string
 * @body NodeMetadata
 * @access Teacher
 */
router.post(
  "/",
  protectTeacher,
  validateRequest({
    customErrorMessage: "invalid learningPathId request parameter",
    bodySchema: nodeMetadataSchema,
    paramsSchema: learningPathIdSchema,
  }),
  createNodeForPath,
);

/**
 * @route PATCH /learningPath/:learningPathId/node/:nodeId
 * @description Update de node
 * @param pathId: string
 * @param nodeId: string
 * @body NodeMetadata
 * @access Teacher
 */
router.patch(
  "/:nodeId",
  protectTeacher,
  validateRequest({
    customErrorMessage: "invalid learningPathId request parameter",
    paramsSchema: nodeAndLearningPathIdSchema,
  }),
  updateNodeForPath,
);

/**
 * @route DELETE /learningPath/:learningPathId/node/:nodeId
 * @description Verwijder de node
 * @param pathId: string
 * @param nodeId: string
 * @access Teacher
 */
router.delete(
  "/:nodeId",
  protectTeacher,
  validateRequest({
    customErrorMessage: "invalid learningPathId request parameter",
    paramsSchema: nodeAndLearningPathIdSchema,
  }),
  deleteNodeFromPath,
);

export default router;
