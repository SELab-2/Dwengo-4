// controllers/question/questionController.ts
import { Response } from "express";
import QuestionService from "../../services/questionsService";
import { AuthenticatedRequest } from "../../interfaces/extendedTypeInterfaces";
// errors
import { BadRequestError } from "../../errors/errors";

/**
 * Hulp om try/catch te bundelen: elke controller-functie in "handleRequest"
 */
const handleRequest = (
  handler: (req: AuthenticatedRequest, res: Response) => Promise<void>
) => async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    await handler(req, res);
  } catch (err: any) {
    const msg = err.message || "Unknown error";
    res.status(err.statusCode || 400).json({ error: msg });
  }
};

// ----------------------------------
// CREATE: SPECIFIC
// ----------------------------------
export const createQuestionSpecific = handleRequest(async (req, res) => {
  const { assignmentId } = req.params;
  const { teamId, title, text, isExternal, localLearningObjectId, dwengoHruid, dwengoLanguage, dwengoVersion } = req.body;

  if (!assignmentId || !teamId || !title || !text) {
    throw new BadRequestError("Missing required fields (assignmentId, teamId, title, text).");
  }
  const studentId = req.user!.id; // verondersteld dat user is student

  const questionSpec = await QuestionService.createQuestionSpecific(
    Number(assignmentId),
    Number(teamId),
    studentId,
    title,
    text,
    !!isExternal,
    localLearningObjectId,
    dwengoHruid,
    dwengoLanguage,
    dwengoVersion ? Number(dwengoVersion) : undefined
  );

  res.status(201).json(questionSpec);
});

// ----------------------------------
// CREATE: GENERAL
// ----------------------------------
export const createQuestionGeneral = handleRequest(async (req, res) => {
  const { assignmentId } = req.params;
  const { teamId, title, text, isExternal, pathRef, dwengoLanguage } = req.body;

  if (!assignmentId || !teamId || !title || !text || !pathRef) {
    throw new BadRequestError("Missing required fields (assignmentId, teamId, title, text, pathRef).");
  }
  const studentId = req.user!.id;

  const questionGen = await QuestionService.createQuestionGeneral(
    Number(assignmentId),
    Number(teamId),
    studentId,
    title,
    text,
    !!isExternal,
    pathRef,
    dwengoLanguage
  );

  res.status(201).json(questionGen);
});

// ----------------------------------
// CREATE message (reply)
// ----------------------------------
export const createQuestionMessage = handleRequest(async (req, res) => {
  const { questionId } = req.params;
  const { text } = req.body;

  if (!questionId || !text) {
    throw new BadRequestError("Missing questionId or text");
  }
  const userId = req.user!.id;

  const msg = await QuestionService.createQuestionMessage(Number(questionId), userId, text);
  res.status(201).json(msg);
});

// ----------------------------------
// UPDATE question
// ----------------------------------
export const updateQuestion = handleRequest(async (req, res) => {
  const { questionId } = req.params;
  const { title } = req.body;
  if (!title) {
    throw new BadRequestError("Missing title");
  }
  const updated = await QuestionService.updateQuestion(Number(questionId), title);
  res.status(200).json(updated);
});

// ----------------------------------
// UPDATE message
// ----------------------------------
export const updateQuestionMessage = handleRequest(async (req, res) => {
  const { questionMessageId } = req.params;
  const { text } = req.body;

  if (!text) {
    throw new BadRequestError("Missing text for question message update.");
  }

  const updatedMsg = await QuestionService.updateQuestionMessage(Number(questionMessageId), text);
  res.status(200).json(updatedMsg);
});

// ----------------------------------
// GET question
// ----------------------------------
export const getQuestion = handleRequest(async (req, res) => {
  const { questionId } = req.params;
  const q = await QuestionService.getQuestion(Number(questionId));
  res.json(q);
});

// ----------------------------------
// GET questions by team
// ----------------------------------
export const getQuestionsTeam = handleRequest(async (req, res) => {
  const { teamId } = req.params;
  const questions = await QuestionService.getQuestionsForTeam(Number(teamId));
  res.json(questions);
});

// ----------------------------------
// GET questions by class
// ----------------------------------
export const getQuestionsClass = handleRequest(async (req, res) => {
  const { classId } = req.params;
  const questions = await QuestionService.getQuestionsForClass(Number(classId));
  res.json(questions);
});

// ----------------------------------
// GET questions for assignment + class
// ----------------------------------
export const getQuestionsAssignment = handleRequest(async (req, res) => {
  const { assignmentId, classId } = req.params;
  const questions = await QuestionService.getQuestionsForAssignment(Number(assignmentId), Number(classId));
  res.json(questions);
});

// ----------------------------------
// GET question messages
// ----------------------------------
export const getQuestionMessages = handleRequest(async (req, res) => {
  const { questionId } = req.params;
  const msgs = await QuestionService.getQuestionMessages(Number(questionId));
  res.json(msgs);
});

// ----------------------------------
// DELETE question
// ----------------------------------
export const deleteQuestion = handleRequest(async (req, res) => {
  const { questionId } = req.params;
  await QuestionService.deleteQuestion(Number(questionId));
  res.status(204).end();
});

// ----------------------------------
// DELETE message
// ----------------------------------
export const deleteQuestionMessage = handleRequest(async (req, res) => {
  const { questionMessageId } = req.params;
  await QuestionService.deleteQuestionMessage(Number(questionMessageId));
  res.status(204).end();
});
