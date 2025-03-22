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
 * @route POST /teacher/createdLearningObject
 * @description Nieuw leerobject aanmaken
 * @access Teacher
 *
 * @route GET  /teacher/createdLearningObject
 * @description Alle leerobjecten van deze teacher ophalen
 * @access Teacher
 */
router.route("/").post(createLocalLearningObject).get(getLocalLearningObjects);

/**
 * @route GET    /teacher/createdLearningObject/:id
 * @description Specifiek leerobject ophalen
 * @param createdLearningObjectId: string
 * @access Teacher
 *
 * @route PATCH   /teacher/createdLearningObject/:id
 * @description Leerobject updaten
 * @param createdLearningObjectId: string
 * @body LocalLearningObjectData (optioneel)
 * @access Teacher
 *
 * @route DELETE /teacher/createdLearningObject/:id
 * @description Leerobject verwijderen
 * @param createdLearningObjectId: string
 * @access Teacher
 */
router
  .route("/:createdLearningObjectId")
  .get(getLocalLearningObjectById)
  .patch(updateLocalLearningObject)
  .delete(deleteLocalLearningObject);

export default router;
