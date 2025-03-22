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
 * POST /teacher/createdLearningObject -> nieuw leerobject aanmaken
 * GET  /teacher/createdLearningObject -> alle leerobjecten van deze teacher
 */
router.route("/").post(createLocalLearningObject).get(getLocalLearningObjects);

/**
 * GET    /teacher/createdLearningObject/:id -> 1 leerobject ophalen
 * PATCh   /teacher/createdLearningObject/:id -> updaten (gedeeltelijk)
 * DELETE /teacher/createdLearningObject/:id -> verwijderen
 */
router
  .route("/:id")
  .get(getLocalLearningObjectById)
  .patch(updateLocalLearningObject)
  .delete(deleteLocalLearningObject);

export default router;
