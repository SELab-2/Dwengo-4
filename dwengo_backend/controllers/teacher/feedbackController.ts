import {Request, Response} from "express";
import service from "../../services/feedbackService";

export default class FeedbackController {
    // Get all feedback
    static async getAllFeedback(req: Request, res: Response) {
        try {
            const feedback = await service.getAllFeedback();
            res.json(feedback);
        } catch (error) {
            res.status(500).json({message: error});
        }
    }
}
