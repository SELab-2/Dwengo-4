import express from "express";
import {
  createLocalLearningObject,
  getLocalLearningObjects,
  getLocalLearningObjectById,
  updateLocalLearningObject,
  deleteLocalLearningObject,
} from "../../controllers/teacher/teacherLocalLearningObjectController";
import { protectTeacher } from "../../middleware/teacherAuthMiddleware";

const router = express.Router();

// Alle routes hier alleen toegankelijk voor geauthenticeerde teachers
router.use(protectTeacher);

/**
 * POST /teacher/learningObjects -> nieuw leerobject aanmaken
 * GET  /teacher/learningObjects -> alle leerobjecten van deze teacher
 */
router
  .route("/")
  .post(createLocalLearningObject)
  .get(getLocalLearningObjects);

/**
 * GET    /teacher/learningObjects/:id -> 1 leerobject ophalen
 * PATCh   /teacher/learningObjects/:id -> updaten (gedeeltelijk)
 * DELETE /teacher/learningObjects/:id -> verwijderen
 */
router
  .route("/:id")
  .get(getLocalLearningObjectById)
  .patch(updateLocalLearningObject)
  .delete(deleteLocalLearningObject);

export default router;
