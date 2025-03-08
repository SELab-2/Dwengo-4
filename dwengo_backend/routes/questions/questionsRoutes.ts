import express from "express";
// De "* as ..." is hier echt nodig, geloof mij.
import * as questionController from "../../controllers/question/questionController";
import { protectStudent } from "../../middleware/studentAuthMiddleware"

const router = express.Router();
//router.use(protectStudent);

router.post("/assignment/:assignmentId/learningPath/:learningPathId/question", questionController.createQuestionGeneral);
router.post("/assignment/:assignmentId/learningPath/:learningPathId/learningObject/:learningObjectId/question", questionController.createQuestionSpecific);
router.post("/question/:questionId", questionController.createQuestionConversation);

router.patch("/question/:questionId/conversation/:questionConversationId", questionController.updateQuestionConversation);

router.get("/question/:questionId", questionController.getQuestion);
router.get("/team/:teamId/questions", questionController.getQuestionsTeam);
router.get("/class/:classId/questions", questionController.getQuestionsClass);
router.get("/assignment/:assignmentId/class/:classId/questions", questionController.getQuestionsAssignment);
router.get("/question/:questionId/conversations", questionController.getQuestionConversations);

router.delete("/question/:questionId", questionController.deleteQuestion);
router.delete("/question/:questionId/conversation/:questionConversationId", questionController.deleteQuestionConversation);
export default router;
