
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
  authorizeQuestion,
  authorizeMessageUpdate,
  authorizeMessageDelete,
  authorizeQuestionUpdate
} from "../../middleware/questionsAuthMiddleware";

const router = express.Router();

// Gebruiker moet ingelogd zijn
router.use(protectAnyUser);

// CREATE SPECIFIC question
router.post("/specific/assignment/:assignmentId", createQuestionSpecific);

// CREATE GENERAL question
router.post("/general/assignment/:assignmentId", createQuestionGeneral);

// CREATE message
router.post("/:questionId/message", authorizeQuestion, createQuestionMessage);

// UPDATE question (titel)
router.patch("/:questionId", authorizeQuestionUpdate, updateQuestion);
// UPDATE message
router.patch("/:questionId/message/:questionMessageId", authorizeMessageUpdate, updateQuestionMessage);

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
router.delete("/:questionId/message/:questionMessageId", authorizeMessageDelete, deleteQuestionMessage);

export default router;
