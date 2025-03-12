import {Response} from "express";
import service from "../../services/feedbackService";
import {Feedback} from "@prisma/client";
import {AuthenticatedRequest} from "../../interfaces/extendedTypeInterfaces";

export default class FeedbackController {
    static async getAllFeedbackForEvaluation(req: AuthenticatedRequest, res: Response) {
        try {
            const {assignmentId, evaluationId}: { assignmentId: number, evaluationId: string } = req.params;
            const teacherId: number = Number(req.user?.id);

            const feedback: Feedback[] = await service.getAllFeedbackForEvaluation(assignmentId, evaluationId, teacherId);
            res.json(feedback);
        } catch (error) {
            res.status(500).json({error: "Failed to retrieve feedback"});
        }
    }

    static async createFeedback(req: AuthenticatedRequest, res: Response) {
        try {
            const teacherId: number | undefined = req.user?.id;

            const {submissionId, description}: {
                submissionId: number,
                description: string
            } = req.body;

            const feedback: Feedback = await service.createFeedback(submissionId, Number(teacherId), description);
            res.status(201).json(feedback);
        } catch (error) {
            res.status(500).json({error: "Failed to create feedback"});
        }

    }

    static async getFeedbackForSubmission(req: AuthenticatedRequest, res: Response) {
        try {
            const submissionId: number = Number(req.params.submissionId);
            const teacherId: number = Number(req.user?.id);

            const feedback: Feedback = await service.getFeedbackForSubmission(submissionId, teacherId);
            res.json(feedback);
        } catch (error) {
            res.status(500).json({error: "Failed to retrieve feedback"});
        }

    }

    static async updateFeedbackForSubmission(req: AuthenticatedRequest, res: Response) {
        try {
            const submissionId: number = Number(req.params.submissionId);
            const teacherId: number = Number(req.user?.id);

            const {description}: { description: string } = req.body;
            const feedback: Feedback = await service.updateFeedbackForSubmission(submissionId, description, teacherId);
            res.json(feedback)
        } catch (error) {
            res.status(500).json({error: "Failed to update feedback"});
        }
    }

    static async deleteFeedbackForSubmission(req: AuthenticatedRequest, res: Response) {
        try {
            const submissionId: number = Number(req.params.submissionId);
            const teacherId: number = Number(req.user?.id);

            await service.deleteFeedbackForSubmission(submissionId, teacherId);
            res.json({message: "Feedback deleted"});
        } catch (error) {
            res.status(500).json({error: "Failed to delete feedback"});
        }
    }
}
