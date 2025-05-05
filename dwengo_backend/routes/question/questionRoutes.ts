import express, { Router } from "express";
import {
  createQuestionGeneral,
  createQuestionMessage,
  createQuestionSpecific,
  deleteQuestion,
  deleteQuestionMessage,
  getQuestion,
  getQuestionMessages,
  getQuestionsAssignment,
  getQuestionsClass,
  getQuestionsTeam,
  updateQuestion,
  updateQuestionMessage,
} from "../../controllers/question/questionController";

import { protectAnyUser } from "../../middleware/authMiddleware/authAnyUserMiddleware";
import {
  authorizeMessageDelete,
  authorizeMessageUpdate,
  authorizeQuestion,
  authorizeQuestionUpdate,
} from "../../middleware/questionsAuthMiddleware";
import { assignmentIdParamsSchema } from "../../zodSchemas/idSchemas";
import { validateRequest } from "../../middleware/validateRequest";
import { createQuestionSpecificBodySchema } from "../../zodSchemas/bodySchemas";

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
router.post("/general/assignment/:assignmentId", createQuestionGeneral);

// CREATE message
router.post("/:questionId/message", authorizeQuestion, createQuestionMessage);

// UPDATE question (titel)
router.patch("/:questionId", authorizeQuestionUpdate, updateQuestion);
// UPDATE message
router.patch(
  "/:questionId/message/:questionMessageId",
  authorizeMessageUpdate,
  updateQuestionMessage,
);

// GET question
router.get("/:questionId", authorizeQuestion, getQuestion);

// GET messages
router.get("/:questionId/messages", authorizeQuestion, getQuestionMessages);

// GET questions by team
router.get("/team/:teamId", getQuestionsTeam);

// GET questions by class
router.get("/class/:classId", getQuestionsClass);

// GET questions for assignment + class
router.get("/assignment/:assignmentId/class/:classId", getQuestionsAssignment);

// DELETE question
router.delete("/:questionId", authorizeQuestion, deleteQuestion);

// DELETE message
router.delete(
  "/:questionId/message/:questionMessageId",
  authorizeMessageDelete,
  deleteQuestionMessage,
);

export default router;
