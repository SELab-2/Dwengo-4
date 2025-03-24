import {Response} from "express";
import service from "../../services/feedbackService";
import {Feedback} from "@prisma/client";
import {AuthenticatedRequest} from "../../interfaces/extendedTypeInterfaces";
import {getUserFromAuthRequest} from "../../helpers/getUserFromAuthRequest";

export default class FeedbackController {
    static async getAllFeedbackForEvaluation(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const {assignmentId, evaluationId} = req.params;
            const teacherId: number = getUserFromAuthRequest(req).id;

            const feedback: Feedback[] = await service.getAllFeedbackForEvaluation(Number(assignmentId), evaluationId, teacherId);
            res.json(feedback);
        } catch (error) {
            res.status(500).json({error: "Failed to retrieve feedback"});
        }
    }

    static async createFeedback(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const teacherId: number = getUserFromAuthRequest(req).id;

            const {submissionId, description}: {
                submissionId: number,
                description: string
            } = req.body;

            const feedback: Feedback = await service.createFeedback(submissionId, teacherId, description);
            res.status(201).json(feedback);
        } catch (error) {
            res.status(500).json({error: "Failed to create feedback"});
        }

    }

    static async getFeedbackForSubmission(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const submissionId: number = Number(req.params.submissionId);
            const teacherId: number = getUserFromAuthRequest(req).id;

            const feedback: Feedback | null = await service.getFeedbackForSubmission(submissionId, teacherId);
            if (feedback) {
                res.json(feedback);
            } else {
                res.status(404).json({error: "Feedback not found"});
            }
        } catch (error) {
            res.status(500).json({error: "Failed to retrieve feedback"});
        }

    }

    static async updateFeedbackForSubmission(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const submissionId: number = Number(req.params.submissionId);
            const teacherId: number = getUserFromAuthRequest(req).id;

            const {description}: { description: string } = req.body;
            const feedback: Feedback = await service.updateFeedbackForSubmission(submissionId, description, teacherId);
            res.json(feedback)
        } catch (error) {
            res.status(500).json({error: "Failed to update feedback"});
        }
    }

    static async deleteFeedbackForSubmission(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const submissionId: number = Number(req.params.submissionId);
            const teacherId: number = getUserFromAuthRequest(req).id;

            await service.deleteFeedbackForSubmission(submissionId, teacherId);
            res.json({message: "Feedback deleted"});
        } catch (error) {
            res.status(500).json({error: "Failed to delete feedback"});
        }
    }
}
