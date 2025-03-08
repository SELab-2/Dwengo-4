import {Response} from "express";
import service from "../../services/feedbackService";
import {Feedback} from "@prisma/client";
import {AuthenticatedRequest} from "../../middleware/teacherAuthMiddleware";

export default class FeedbackController {
    static async getAllFeedbackForEvaluation(req: AuthenticatedRequest, res: Response) {
        try {
            const evaluationId: string = req.params.evaluationId;
            if (!service.hasEvaluationRights(evaluationId, req, res)) return;

            const feedback: Feedback[] = await service.getAllFeedbackForEvaluation(evaluationId);
            res.json(feedback);
        } catch (error) {
            res.status(500).json({error: "Failed to retrieve feedback"});
        }
    }

    static async createFeedback(req: AuthenticatedRequest, res: Response) {
        try {
            const teacherId: number | undefined = req.user?.id;
            // TODO Is dit sowieso defined of hoe ga ik hier het beste met de undefined om?

            const {submissionId, description}: {
                submissionId: number,
                description: string
            } = req.body;
            // TODO check of deadline al voorbij is
            if (!await service.hasSubmissionRights(submissionId, req, res)) return;


            const feedback: Feedback = await service.createFeedback(submissionId, Number(teacherId), description);
            res.status(201).json(feedback);
        } catch (error) {
            res.status(500).json({error: "Failed to create feedback"});
        }

    }

    static async getFeedbackForSubmission(req: AuthenticatedRequest, res: Response) {
        try {
            const submissionId: number = Number(req.params.submissionId);
            if (!await service.hasSubmissionRights(submissionId, req, res)) return;

            const feedback: Feedback = await service.getFeedbackForSubmission(submissionId);
            res.json(feedback);
        } catch (error) {
            res.status(500).json({error: "Failed to retrieve feedback"});
        }

    }

    static async updateFeedbackForSubmission(req: AuthenticatedRequest, res: Response) {
        try {
            const submissionId: number = Number(req.params.submissionId);
            if (!await service.hasSubmissionRights(submissionId, req, res)) return;

            const {description}: { description: string } = req.body;
            const feedback: Feedback = await service.updateFeedbackForSubmission(submissionId, description);
            res.json(feedback)
        } catch (error) {
            res.status(500).json({error: "Failed to update feedback"});
        }
    }

    static deleteFeedbackForSubmission(req: AuthenticatedRequest, res: Response) {
        try {
            const submissionId: number = Number(req.params.submissionId);
            if (!service.hasSubmissionRights(submissionId, req, res)) return;

            service.deleteFeedbackForSubmission(submissionId);
            res.json({message: "Feedback deleted"});
        } catch (error) {
            res.status(500).json({error: "Failed to delete feedback"});
        }
    }
}
