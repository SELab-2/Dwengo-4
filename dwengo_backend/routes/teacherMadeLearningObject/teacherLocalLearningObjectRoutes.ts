import express, { Router } from "express";
import {
  createLocalLearningObject,
  deleteLocalLearningObject,
  getLocalLearningObjectById,
  getLocalLearningObjects,
  updateLocalLearningObject,
} from "../../controllers/teacher/teacherLocalLearningObjectController";
import { protectTeacher } from "../../middleware/authMiddleware/teacherAuthMiddleware";
import {
  localLearningObjectBodySchema,
  partialLocalLearningObjectBodySchema,
} from "../../zodSchemas";
import { validateRequest } from "../../middleware/validateRequest";

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
router
  .route("/")
  .post(
    validateRequest({
      customErrorMessage:
        "invalid request for creating a local learning object",
      bodySchema: localLearningObjectBodySchema,
    }),
    createLocalLearningObject,
  )
  .get(getLocalLearningObjects);

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
  .route("/:createdLearningObjectId")
  .get(getLocalLearningObjectById)
  .patch(
    validateRequest({
      customErrorMessage:
        "invalid request for updating a local learning object",
      bodySchema: partialLocalLearningObjectBodySchea,
    }),
    updateLocalLearningObjet,
  )
  .delete(deleteLocalLearningObject);

export default router;
