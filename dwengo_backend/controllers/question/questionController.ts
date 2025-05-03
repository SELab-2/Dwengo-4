import QuestionService from "../../services/questionsService";
import { BadRequestError } from "../../errors/errors";
import asyncHandler from "express-async-handler";
import {
  AuthenticatedRequest,
  AuthenticatedUser,
} from "../../interfaces/extendedTypeInterfaces";
import { Response } from "express";
import { getUserFromAuthRequest } from "../../helpers/getUserFromAuthRequest";

const createdQuestionMessage = "Question successfully created.";
const badRequestMessage =
  "Missing required fields (assignmentId, teamId, title, text).";
const missingRole = "User role is missing.";

// CREATE SPECIFIC
export const createQuestionSpecific = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { assignmentId } = req.params;
    const {
      teamId,
      title,
      text,
      isExternal,
      localLearningObjectId,
      dwengoHruid,
      dwengoLanguage,
      dwengoVersion,
      isPrivate,
    } = req.body;

    if (!assignmentId || !teamId || !title || !text) {
      throw new BadRequestError(badRequestMessage);
    }
    const user: AuthenticatedUser = getUserFromAuthRequest(req);
    if (!user.role) {
      throw new BadRequestError(missingRole);
    }

    const questionSpec = await QuestionService.createQuestionSpecific(
      Number(assignmentId),
      Number(teamId),
      user.id,
      user.role,
      title,
      text,
      !!isExternal,
      !!isPrivate,
      localLearningObjectId,
      dwengoHruid,
      dwengoLanguage,
      dwengoVersion ? Number(dwengoVersion) : undefined,
    );

    res.status(201).json({
      message: createdQuestionMessage,
      questionSpec,
      questionId: questionSpec.questionId,
    });
  },
);

// CREATE GENERAL
export const createQuestionGeneral = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { assignmentId } = req.params;
    const {
      teamId,
      title,
      text,
      isExternal,
      pathRef,
      dwengoLanguage,
      isPrivate,
    } = req.body;

    if (!assignmentId || !teamId || !title || !text || !pathRef) {
      throw new BadRequestError(badRequestMessage);
    }
    const user = getUserFromAuthRequest(req);
    if (!user.role) {
      throw new BadRequestError(missingRole);
    }

    const questionGen = await QuestionService.createQuestionGeneral(
      Number(assignmentId),
      Number(teamId),
      user.id,
      user.role,
      title,
      text,
      !!isExternal,
      !!isPrivate,
      pathRef,
      dwengoLanguage,
    );

    res.status(201).json({
      message: createdQuestionMessage,
      questionGen,
      questionId: questionGen.questionId,
    });
  },
);

// CREATE message
export const createQuestionMessage = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { questionId } = req.params;
    const { text } = req.body;

    if (!questionId) {
      throw new BadRequestError("Missing question id.");
    }

    if (!text) {
      throw new BadRequestError("Missing text.");
    }
    const userId = getUserFromAuthRequest(req).id;

    const msg = await QuestionService.createQuestionMessage(
      Number(questionId),
      userId,
      text,
    );
    res.status(201).json({
      message: "Message successfully created.",
      msg,
      id: msg.id,
    });
  },
);

// UPDATE question
export const updateQuestion = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { questionId } = req.params;
    const { title } = req.body;
    if (!title) {
      throw new BadRequestError("Missing title.");
    }
    const updated = await QuestionService.updateQuestion(
      Number(questionId),
      title,
    );
    res
      .status(200)
      .json({ message: "Question successfully updated.", updated });
  },
);

// UPDATE message
export const updateQuestionMessage = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { questionMessageId } = req.params;
    const { text } = req.body;

    if (!text) {
      throw new BadRequestError("Missing text for question message update.");
    }
    const updatedMsg = await QuestionService.updateQuestionMessage(
      Number(questionMessageId),
      text,
    );
    res
      .status(200)
      .json({ message: "Message successfully updated.", updatedMsg });
  },
);

// GET question
export const getQuestion = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { questionId } = req.params;
    const q = await QuestionService.getQuestion(Number(questionId));
    res.json(q);
  },
);

// GET questions by team
export const getQuestionsTeam = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { teamId } = req.params;
    const user = getUserFromAuthRequest(req);
    const questions = await QuestionService.getQuestionsForTeam(
      Number(teamId),
      user, // pass user => filtering
    );
    res.json(questions);
  },
);

// GET questions by class
export const getQuestionsClass = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { classId } = req.params;
    const user = getUserFromAuthRequest(req);
    const questions = await QuestionService.getQuestionsForClass(
      Number(classId),
      user,
    );
    res.json(questions);
  },
);

// GET questions for assignment + class
export const getQuestionsAssignment = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { assignmentId, classId } = req.params;
    const user = getUserFromAuthRequest(req);
    const questions = await QuestionService.getQuestionsForAssignment(
      Number(assignmentId),
      Number(classId),
      user,
    );
    res.json(questions);
  },
);

// GET question messages
export const getQuestionMessages = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { questionId } = req.params;
    const msgs = await QuestionService.getQuestionMessages(Number(questionId));
    res.json(msgs);
  },
);

// DELETE question
export const deleteQuestion = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { questionId } = req.params;
    await QuestionService.deleteQuestion(Number(questionId));
    res.status(204).end();
  },
);

// DELETE message
export const deleteQuestionMessage = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { questionMessageId } = req.params;
    await QuestionService.deleteQuestionMessage(Number(questionMessageId));
    res.status(204).end();
  },
);
