import {Request, Response} from "express";
import service from "../../services/feedbackService";

export default class FeedbackController {

    static async getAllFeedbackForEvaluation(req: Request, res: Response) {
        try {
            //TODO hoe teacher checken?
            const evaluationId: string = req.params.evaluationId;
            const feedback = await service.getAllFeedbackForEvaluation(evaluationId);
            res.json(feedback);
        } catch (error) {
            res.status(500).json({error: "Failed to retrieve feedback"});
        }
    }
}
