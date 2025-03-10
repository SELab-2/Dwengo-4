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
    "/assignment/:assignmentId/learningPath/:learningPathId/question",
    authorizeStudentInTeamWithAssignment,
    createQuestionGeneral
);
router.post(
    "/assignment/:assignmentId/learningPath/:learningPathId/learningObject/:learningObjectId/question",
    authorizeStudentInTeamWithAssignment,
    createQuestionSpecific
);
router.post(
    "/question/:questionId",
    authorizeQuestion,
    createQuestionMessage
);

// Routes for updating questions
router.patch(
    "/question/:questionId",
    authorizeQuestion,
    updateQuestion);

router.patch(
    "/question/:questionId/message/:questionMessageId",
    authorizeOwnerOfQuestionMessage,
    updateQuestionMessage);

// Routes for retrieving questions
router.get(
    "/question/:questionId",
    authorizeQuestion,
    getQuestion
);
router.get(
    "/team/:teamId/questions",
    authorizeStudentInTeamThatCreatedQuestion,
    getQuestionsTeam
);
router.get(
    "/class/:classId/questions",
    authorizeTeacherOfClass,
    getQuestionsClass
);
router.get(
    "/assignment/:assignmentId/class/:classId/questions",
    authorizeTeacherOfAssignmentClass,
    getQuestionsAssignment
);
router.get(
    "/question/:questionId/messages",
    authorizeQuestion,
    getQuestionMessages
);

// Routes for deleting questions
router.delete(
    "/question/:questionId",
    authorizeQuestion,
    deleteQuestion
);
router.delete(
    "/question/:questionId/message/:questionMessageId",
    authorizeOwnerOfQuestionMessage,
    deleteQuestionMessage
);

export default router;
