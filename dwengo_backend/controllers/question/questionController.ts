import { Request, Response } from "express";
import QuestionService from "../../services/questionService";

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
    const learningPathId: number = parseInt(req.params.learnPathId, 10);
    const { description, teamId, studentId }: { description: string, teamId: number, studentId: number } = req.body;
    const questionGeneral = await QuestionService.createQuestionGeneral(description, teamId, studentId, "GENERAL", learningPathId);
    res.status(201).json(questionGeneral);
});

export const createQuestionSpecific = handleRequest(async (req: Request, res: Response): Promise<void> => {
    const learningObjectId: string = req.params.learningObjectId;
    const { description, teamId, studentId }: { description: string, teamId: number, studentId: number } = req.body;
    const questionSpecific = await QuestionService.createQuestionSpecific(description, teamId, studentId, "SPECIFIC", learningObjectId);
    res.status(201).json(questionSpecific);
});

