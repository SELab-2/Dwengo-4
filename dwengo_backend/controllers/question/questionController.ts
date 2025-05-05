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

    const user: AuthenticatedUser = assertUserHasRole(
      getUserFromAuthRequest(req),
    );

    const questionSpec = await QuestionService.createQuestionSpecific(
      assignmentId as unknown as number,
      teamId,
      user.id,
      user.role!,
      title,
      text,
      !!isExternal,
      !!isPrivate,
      localLearningObjectId,
      dwengoHruid,
      dwengoLanguage,
      dwengoVersion ? dwengoVersion : undefined,
    );

    res.status(201).json({
      message: createdQuestionMessage,
      questionSpec,
      questionId: questionSpec.questionId,
    });
  },
);

const assertUserHasRole = (user: AuthenticatedUser) => {
  if (!user.role) throw new BadRequestError(missingRole);
  return user;
};

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

    const user = assertUserHasRole(getUserFromAuthRequest(req));

    const questionGen = await QuestionService.createQuestionGeneral(
      assignmentId as unknown as number,
      teamId as unknown as number,
      user.id,
      user.role!,
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

    const userId = getUserFromAuthRequest(req).id;

    const msg = await QuestionService.createQuestionMessage(
      questionId as unknown as number,
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

    const updated = await QuestionService.updateQuestion(
      questionId as unknown as number,
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
