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
            return;
        }
    };


export const createQuestionGeneral = handleRequest(async (req: Request, res: Response): Promise<void> => {
    const { assignmentId, learningPathId } = req.params;
    const { title, text, teamId, studentId }: { title: string, text: string, teamId: number, studentId: number } = req.body;
    const questionGeneral = await QuestionService.createQuestionGeneral(Number(assignmentId), title, text, teamId, studentId, "GENERAL", Number(learningPathId));
    res.status(201).json(questionGeneral);
});



export const createQuestionSpecific = handleRequest(async (req: Request, res: Response): Promise<void> => {
    const { assignmentId, learningPathId, learningObjectId } = req.params;
    const { title, text, teamId, studentId }: { title: string, text: string, teamId: number, studentId: number } = req.body;
    const questionSpecific = await QuestionService.createQuestionSpecific(Number(assignmentId), title, Number(learningPathId), text, teamId, studentId, "SPECIFIC", learningObjectId);
    res.status(201).json(questionSpecific);
});

export const createQuestionMessage = handleRequest(async (req: Request, res: Response): Promise<void> => {
    const { questionId } = req.params;
    const { text, userId } = req.body;
    const questionMessage = await QuestionService.createQuestionMessage(Number(questionId), text, Number(userId));
    res.status(201).json(questionMessage);
});

export const updateQuestion = handleRequest(async (req: Request, res: Response): Promise<void> => {
    const { questionId } = req.params;
    const { title } = req.body;
    const question = await QuestionService.updateQuestion(Number(questionId), title);
    res.status(201).json(question);
});

export const updateQuestionMessage = handleRequest(async (req: Request, res: Response): Promise<void> => {
    const { questionId, questionMessageId } = req.params;
    const { text, userId } = req.body;
    const questionMessage = await QuestionService.updateQuestionMessage(Number(questionId), Number(questionMessageId), text, userId);
    res.status(201).json(questionMessage);
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

export const getQuestionMessages = handleRequest(async (req: Request, res: Response): Promise<void> => {
    const { questionId } = req.params;
    const messages = await QuestionService.getQuestionMessages(Number(questionId));
    res.status(200).json(messages);
});

export const deleteQuestion = handleRequest(async (req: Request, res: Response): Promise<void> => {
    const { questionId } = req.params;
    await QuestionService.deleteQuestion(Number(questionId));
    res.status(204).end();
});

export const deleteQuestionMessage = handleRequest(async (req: Request, res: Response): Promise<void> => {
    const { questionId, questionMessageId } = req.params;
    await QuestionService.deleteQuestionMessage(Number(questionId), Number(questionMessageId));
    res.status(204).end();
});

