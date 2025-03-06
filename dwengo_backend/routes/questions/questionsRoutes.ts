import express from "express";
// De "* as ..." is hier echt nodig, geloof mij.
import * as questionController from "../../controllers/question/questionController";
import { isTeacher } from "../../middleware/teacherAuthMiddleware"

const router = express.Router();

router.post("/:learnPathId/", questionController.createQuestionGeneral);
router.post("/:learnObjectId/", questionController.createQuestionSpecific);

export default router;
