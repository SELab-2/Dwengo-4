import express, { Router } from "express";
import {
  createLocalLearningObject,
  deleteLocalLearningObject,
  getLocalLearningObjectById,
  getLocalLearningObjects,
  updateLocalLearningObject,
  getLocalLearningObjectHtml,
} from "../../controllers/teacher/teacherLocalLearningObjectController";
import { protectTeacher } from "../../middleware/authMiddleware/teacherAuthMiddleware";

const router: Router = express.Router();

// Alle routes hier alleen toegankelijk voor geauthenticeerde teachers
router.use(protectTeacher);

/**
 * @route POST /learningObjectByTeacher
 * @description Nieuw leerobject aanmaken
 * @access Teacher
 *
 * @route GET  /learningObjectByTeacher
 * @description Alle leerobjecten van deze teacher ophalen
 * @access Teacher
 */


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
  .route("/")
  .post(protectTeacher, createLocalLearningObject)
  .get(protectTeacher, getLocalLearningObjects);
router
  .route("/:createdLearningObjectId")
  .get(protectTeacher, getLocalLearningObjectById)
  .patch(protectTeacher, updateLocalLearningObject)
  .delete(protectTeacher, deleteLocalLearningObject);

router.get('/:createdLearningObjectId/html', protectTeacher, getLocalLearningObjectHtml);
export default router;
