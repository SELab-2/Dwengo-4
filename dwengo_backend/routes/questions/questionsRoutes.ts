import express from "express";
import * as questionController from "../../controllers/question/questionController";
import { protectAnyUser } from "../../middleware/authAnyUserMiddleware";
import * as questionsAuthMiddleware from "../../middleware/questionsAuthMiddleware";

const router = express.Router();
router.use(protectAnyUser);

// Routes for creating questions
router.post(
    "/assignment/:assignmentId/learningPath/:learningPathId/question",
    questionsAuthMiddleware.authorizeStudentInTeamWithAssignment,
    questionController.createQuestionGeneral
);
router.post(
    "/assignment/:assignmentId/learningPath/:learningPathId/learningObject/:learningObjectId/question",
    questionsAuthMiddleware.authorizeStudentInTeamWithAssignment,
    questionController.createQuestionSpecific
);
router.post(
    "/question/:questionId",
    questionsAuthMiddleware.authorizeQuestion,
    questionController.createQuestionConversation
);

// Routes for updating questions
router.patch(
    "/question/:questionId/conversation/:questionConversationId",
    questionsAuthMiddleware.authorizeOwnerOfQuestionConversation,
    questionController.updateQuestionConversation
);

// Routes for retrieving questions
router.get(
    "/question/:questionId",
    questionsAuthMiddleware.authorizeQuestion,
    questionController.getQuestion
);
router.get(
    "/team/:teamId/questions",
    questionsAuthMiddleware.authorizeStudentInTeamThatCreatedQuestion,
    questionController.getQuestionsTeam
);
router.get(
    "/class/:classId/questions",
    questionsAuthMiddleware.authorizeTeacherOfClass,
    questionController.getQuestionsClass
);
router.get(
    "/assignment/:assignmentId/class/:classId/questions",
    questionsAuthMiddleware.authorizeTeacherOfAssignmentClass,
    questionController.getQuestionsAssignment
);
router.get(
    "/question/:questionId/conversations",
    questionsAuthMiddleware.authorizeQuestion,
    questionController.getQuestionConversations
);

// Routes for deleting questions
router.delete(
    "/question/:questionId",
    questionsAuthMiddleware.authorizeQuestion,
    questionController.deleteQuestion
);
router.delete(
    "/question/:questionId/conversation/:questionConversationId",
    questionsAuthMiddleware.authorizeOwnerOfQuestionConversation,
    questionController.deleteQuestionConversation
);

export default router;
