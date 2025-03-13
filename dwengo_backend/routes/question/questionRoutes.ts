import express from "express";
import {
    createQuestionGeneral,
    createQuestionSpecific,
    createQuestionMessage,
    updateQuestion,
    updateQuestionMessage,
    getQuestion,
    getQuestionsTeam,
    getQuestionsClass,
    getQuestionsAssignment,
    getQuestionMessages,
    deleteQuestion,
    deleteQuestionMessage
} from "../../controllers/question/questionController";
import { protectAnyUser } from "../../middleware/authAnyUserMiddleware";
import {
    authorizeStudentInTeamWithAssignment,
    authorizeQuestion,
    authorizeOwnerOfQuestionMessage,
    authorizeStudentInTeamThatCreatedQuestion,
    authorizeTeacherOfClass,
    authorizeTeacherOfAssignmentClass
} from "../../middleware/questionsAuthMiddleware";

const router = express.Router();
router.use(protectAnyUser);

// Routes for creating questions
router.post(
    "/assignment/:assignmentId/learningPath/:learningPathId/",
    authorizeStudentInTeamWithAssignment,
    createQuestionGeneral
);
router.post(
    "/assignment/:assignmentId/learningPath/:learningPathId/learningObject/:learningObjectId/",
    authorizeStudentInTeamWithAssignment,
    createQuestionSpecific
);
router.post(
    "/:questionId/message",
    authorizeQuestion,
    createQuestionMessage
);

// Routes for updating questions
router.patch(
    "/:questionId",
    authorizeQuestion,
    updateQuestion);

router.patch(
    "/:questionId/message/:questionMessageId",
    authorizeOwnerOfQuestionMessage,
    updateQuestionMessage);

// Routes for retrieving questions
router.get(
    "/:questionId",
    authorizeQuestion,
    getQuestion
);
router.get(
    "/team/:teamId/",
    authorizeStudentInTeamThatCreatedQuestion,
    getQuestionsTeam
);
router.get(
    "/class/:classId",
    authorizeTeacherOfClass,
    getQuestionsClass
);
router.get(
    "/assignment/:assignmentId/class/:classId",
    authorizeTeacherOfAssignmentClass,
    getQuestionsAssignment
);
router.get(
    "/:questionId/messages",
    authorizeQuestion,
    getQuestionMessages
);

// Routes for deleting questions
router.delete(
    "/:questionId",
    authorizeQuestion,
    deleteQuestion
);
router.delete(
    "/:questionId/message/:questionMessageId",
    authorizeOwnerOfQuestionMessage,
    deleteQuestionMessage
);

export default router;
