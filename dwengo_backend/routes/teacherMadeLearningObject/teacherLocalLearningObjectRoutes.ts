import express from "express";
import {
  createLocalLearningObject,
  getLocalLearningObjects,
  getLocalLearningObjectById,
  updateLocalLearningObject,
  deleteLocalLearningObject,
  getLocalLearningObjectHtml
} from "../../controllers/teacher/teacherLocalLearningObjectController";
import { protectTeacher } from "../../middleware/teacherAuthMiddleware";

const router = express.Router();

/**
 * @route POST /learningObjectByTeacher
 * @description Nieuw leerobject aanmaken
 * @access Teacher
 *
 * @route GET  /learningObjectByTeacher
 * @description Alle leerobjecten van deze teacher ophalen
 * @access Teacher
 */
router
  .route("/")
  .post(protectTeacher, createLocalLearningObject)
  .get(protectTeacher, getLocalLearningObjects);

/**
 * @route GET    /learningObjectByTeacher/:createdLearningObjectId
 * @description Specifiek leerobject ophalen
 * @param createdLearningObjectId: string
 * @access Teacher
 *
 * @route PATCH   /learningObjectByTeacher/:createdLearningObjectId
 * @description Leerobject updaten
 * @param createdLearningObjectId: string
 * @body LocalLearningObjectData (optioneel)
 * @access Teacher
 *
 * @route DELETE /learningObjectByTeacher/:createdLearningObjectId
 * @description Leerobject verwijderen
 * @param createdLearningObjectId: string
 * @access Teacher
 */
router
  .route("/:id")
  .get(protectTeacher, getLocalLearningObjectById)
  .patch(protectTeacher, updateLocalLearningObject)
  .delete(protectTeacher, deleteLocalLearningObject);


router.get('/:id/html', protectTeacher, getLocalLearningObjectHtml);
export default router;
