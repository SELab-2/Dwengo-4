import express, { Router } from "express";
import {
  createQuestionMessage,
  createQuestionSpecific,
  deleteQuestion,
  deleteQuestionMessage,
  getQuestionMessages,
  getQuestionsClass,
  updateQuestionMessage,
} from "../../controllers/question/questionController";

import { protectAnyUser } from "../../middleware/authMiddleware/authAnyUserMiddleware";
import {
  authorizeMessageDelete,
  authorizeMessageUpdate,
  authorizeQuestion,
  authorizeQuestionUpdate,
} from "../../middleware/authMiddleware/questionsAuthMiddleware";
import { validateRequest } from "../../middleware/validateRequest";
import {
  assignmentIdParamsSchema,
  classIdParamsSchema,
  createQuestionSpecificBodySchema,
  questionIdParamsSchema,
  questionMessageIdParamsSchema,
  textBodySchema,
} from "../../zodSchemas";

const router: Router = express.Router();

// Gebruiker moet ingelogd zijn
router.use(protectAnyUser);

// CREATE SPECIFIC question
router.post(
  "/specific/assignment/:assignmentId",
  validateRequest({
    customErrorMessage: "invalid request for creating a specific question",
    paramsSchema: assignmentIdParamsSchema,
    bodySchema: createQuestionSpecificBodySchema,
  }),
  createQuestionSpecific,
);

// CREATE GENERAL question
router.post(
  "/general/assignment/:assignmentId",
  validateRequest({
    customErrorMessage: "invalid request for creating a general question",
    paramsSchema: assignmentIdParamsSchema,
    bodySchema: createQuestionGeneralBodySchea,
  }),
  createQuestionGenerl,
);

// CREATE message
router.post(
  "/:questionId/message",
  authorizeQuestion,
  validateRequest({
    customErrorMessage: "invalid request for creating a message",
    paramsSchema: questionIdParamsSchema,
    bodySchema: textBodySchema,
  }),
  createQuestionMessage,
);

// UPDATE question (titel)
router.patch(
  "/:questionId",
  authorizeQuestionUpdate,
  validateRequest({
    customErrorMessage: "invalid request for updating a question",
    paramsSchema: questionIdParamsSchema,
    bodySchema: titleBodySchea,
  }),
  updateQuestin,
);
// UPDATE message
router.patch(
  "/:questionId/message/:questionMessageId",
  authorizeMessageUpdate,
  validateRequest({
    customErrorMessage: "invalid request for updating a message",
    bodySchema: textBodySchema,
    paramsSchema: questionMessageIdParamsSchema,
  }),
  updateQuestionMessage,
);

// GET question
router.get(
  "/:questionId",
  authorizeQuestion,
  validateRequest({
    customErrorMessage: "invalid request for getting a question",
    paramsSchema: questionIdParamsSchem,
  }),
  getQuestio,
);

// GET messages
router.get(
  "/:questionId/messages",
  authorizeQuestion,
  validateRequest({
    customErrorMessage: "invalid request for getting messages",
    paramsSchema: questionIdParamsSchema,
  }),
  getQuestionMessages,
);

// GET questions by team
router.get(
  "/team/:teamId",
  validateRequest({
    customErrorMessage: "invalid request for getting questions by team",
    paramsSchema: teamIdParamsSchea,
  }),
  getQuestionsTem,
);

// GET questions by class
router.get(
  "/class/:classId",
  validateRequest({
    customErrorMessage: "invalid request for getting questions by class",
    paramsSchema: classIdParamsSchema,
  }),
  getQuestionsClass,
);

// GET questions for assignment and class
router.get(
  "/assignment/:assignmentId/class/:classId",
  validateRequest({
    customErrorMessage:
      "invalid request for getting questions for assignment and class",
    paramsSchema: classAndAssignmentIdParamsSchea,
  }),
  getQuestionsAssignmet,
);

// DELETE question
router.delete(
  "/:questionId",
  authorizeQuestion,
  validateRequest({
    customErrorMessage: "invalid request for deleting a question",
    paramsSchema: questionIdParamsSchema,
  }),
  deleteQuestion,
);

// DELETE a message
router.delete(
  "/:questionId/message/:questionMessageId",
  authorizeMessageDelete,
  validateRequest({
    customErrorMessage: "invalid request for deleting a message",
    paramsSchema: questionMessageIdParamsSchema,
  }),
  deleteQuestionMessage,
);

export default router;
