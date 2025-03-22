// routes/question/questionRoutes.ts
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
// of als je gerichte middleware hebt: protectStudent, etc.

import {
  authorizeQuestion,
  authorizeOwnerOfQuestionMessage,
  // etc. plus wat je nog wilt
} from "../../middleware/questionsAuthMiddleware";

const router = express.Router();

// Het is typisch dat je een user (student/teacher) moet ingelogd zijn
router.use(protectAnyUser);

/** 
 * Voorbeelden van routes. Pas ze aan naar eigen smaak.
 * Je kunt bv. 
 *   POST /question/specific/:assignmentId 
 *   POST /question/general/:assignmentId
 *   etc.
 */

// CREATE SPECIFIC
router.post("/specific/:assignmentId", createQuestionSpecific);

// CREATE GENERAL
router.post("/general/:assignmentId", createQuestionGeneral);

// CREATE message
router.post("/:questionId/message", authorizeQuestion, createQuestionMessage);

// UPDATE question
router.patch("/:questionId", authorizeQuestion, updateQuestion);

// UPDATE message
router.patch("/:questionId/message/:questionMessageId", authorizeOwnerOfQuestionMessage, updateQuestionMessage);

// GET question
router.get("/:questionId", authorizeQuestion, getQuestion);

// GET messages
router.get("/:questionId/messages", authorizeQuestion, getQuestionMessages);

// GET questions by team
router.get("/team/:teamId", getQuestionsTeam);

// GET questions by class
router.get("/class/:classId", getQuestionsClass);

// GET questions by assignment + class
router.get("/assignment/:assignmentId/class/:classId", getQuestionsAssignment);

// DELETE question
router.delete("/:questionId", authorizeQuestion, deleteQuestion);

// DELETE question message
router.delete("/:questionId/message/:questionMessageId", authorizeOwnerOfQuestionMessage, deleteQuestionMessage);

export default router;
