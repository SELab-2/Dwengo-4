import { Request, Response } from "express";
import QuestionService from "../../services/questionsService";

/**
 * Een type voor een Request met een getypeerde user-property.
 */
interface AuthenticatedRequest extends Request {
    user?: {
        id: number;
        role: string;
    };
}

// Higher-order function to handle errors and reduce duplication, copied from joinRequestController.ts
const handleRequest = (handler: (req: Request, res: Response) => Promise<void>) =>
    async (req: Request, res: Response): Promise<void> => {
        try {
            await handler(req, res);
        } catch (error) {
            const message: string = error instanceof Error ? error.message : "An unknown error occurred";
            res.status(400).json({ error: message });
        }
    };


export const createQuestionGeneral = handleRequest(async (req: Request, res: Response): Promise<void> => {
    //print something in ts
    const { assignmentId, learningPathId } = req.params as any;
    const { text, teamId, studentId }: { text: string, teamId: number, studentId: number } = req.body;
    const questionGeneral = await QuestionService.createQuestionGeneral(Number(assignmentId), text, teamId, studentId, "GENERAL", Number(learningPathId));
    res.status(201).json(questionGeneral);
});



export const createQuestionSpecific = handleRequest(async (req: Request, res: Response): Promise<void> => {
    const { assignmentId, learningPathId, learningObjectId } = req.params;
    const { text, teamId, studentId }: { text: string, teamId: number, studentId: number } = req.body;
    const questionSpecific = await QuestionService.createQuestionSpecific(Number(assignmentId), Number(learningPathId), text, teamId, studentId, "SPECIFIC", learningObjectId);
    res.status(201).json(questionSpecific);
});

export const createQuestionConversation = handleRequest(async (req: Request, res: Response): Promise<void> => {
    const { questionId } = req.params;
    const { text, userId } = req.body;
    const questionConversation = await QuestionService.createQuestionConversation(Number(questionId), text, Number(userId));
    res.status(201).json(questionConversation);
});

export const updateQuestionConversation = handleRequest(async (req: Request, res: Response): Promise<void> => {
    const { questionId, questionConversationId } = req.params;
    const { text, userId } = req.body;
    const questionConversation = await QuestionService.updateQuestionConversation(Number(questionId), Number(questionConversationId), text, userId);
    res.status(201).json(questionConversation);
});

export const getQuestion = handleRequest(async (req: Request, res: Response): Promise<void> => {
    const { questionId } = req.params;
    const question = await QuestionService.getQuestion(Number(questionId));
    res.status(200).json(question);
});

export const getQuestionsTeam = handleRequest(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { teamId } = req.params;
    const questions = await QuestionService.getQuestionsTeam(Number(teamId));
    res.status(200).json(questions);
});

export const getQuestionsClass = handleRequest(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { classId } = req.params;
    const questions = await QuestionService.getQuestionsClass(Number(classId));
    res.status(200).json(questions);
});

export const getQuestionsAssignment = handleRequest(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { assignmentId, classId } = req.params;
    const questions = await QuestionService.getQuestionsAssignment(Number(assignmentId), Number(classId));
    res.status(200).json(questions);
});

export const getQuestionConversations = handleRequest(async (req: Request, res: Response): Promise<void> => {
    const { questionId } = req.params;
    const conversations = await QuestionService.getQuestionConversations(Number(questionId));
    res.status(200).json(conversations);
});

export const deleteQuestion = handleRequest(async (req: Request, res: Response): Promise<void> => {
    const { questionId } = req.params;
    await QuestionService.deleteQuestion(Number(questionId));
    res.status(204).end();
});

export const deleteQuestionConversation = handleRequest(async (req: Request, res: Response): Promise<void> => {
    const { questionId, questionConversationId } = req.params;
    await QuestionService.deleteQuestionConversation(Number(questionId), Number(questionConversationId));
    res.status(204).end();
});

