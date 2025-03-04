import {Request, Response} from "express";
import service from "../../services/feedbackService";
import {Feedback} from "@prisma/client";

export default class FeedbackController {
    static async getAllFeedbackForEvaluation(req: Request, res: Response) {
        try {
            //TODO hoe teacher checken?
            const evaluationId: string = req.params.evaluationId;
            const feedback: Feedback[] = await service.getAllFeedbackForEvaluation(evaluationId);
            res.json(feedback);
        } catch (error) {
            res.status(500).json({error: "Failed to retrieve feedback"});
        }
    }

    static async createFeedback(req: Request, res: Response) {
        try {
            const {submissionId, teacherId, description}: {
                submissionId: number,
                teacherId: number,
                description: string
            } = req.body;
            // TODO check if teacher has rights on evaluation
            const feedback: Feedback = await service.createFeedback(submissionId, teacherId, description);
        } catch (error) {
            res.status(500).json({error: "Failed to create feedback"});
        }

    }
}
