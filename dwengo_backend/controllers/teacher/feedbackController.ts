import { Response } from "express";
import service from "../../services/feedbackService";
import { Feedback } from "@prisma/client";
import { AuthenticatedRequest } from "../../interfaces/extendedTypeInterfaces";
import { getUserFromAuthRequest } from "../../helpers/getUserFromAuthRequest";

export default class FeedbackController {
  static async getAllFeedbackForEvaluation(
    req: AuthenticatedRequest,
    res: Response,
  ): Promise<void> {
    try {
      const { assignmentId, evaluationId } = req.params;
      const teacherId: number = getUserFromAuthRequest(req).id;

      const feedback: Feedback[] = await service.getAllFeedbackForEvaluation(
        Number(assignmentId),
        evaluationId,
        teacherId,
      );
      res.status(200).json(feedback);
    } catch (_error) {
      res.status(500).json({ error: "Failed to retrieve feedback" });
    }
  }

  static async createFeedback(
    req: AuthenticatedRequest,
    res: Response,
  ): Promise<void> {
    try {
      const teacherId: number = getUserFromAuthRequest(req).id;
      const submissionId: number = Number(req.params.submissionId);

      const description: string = req.body.description;

      const feedback: Feedback = await service.createFeedback(
        submissionId,
        teacherId,
        description,
      );
      res.status(201).json(feedback);
    } catch (_error) {
      res.status(500).json({ error: "Failed to create feedback" });
    }
  }

  static async getFeedbackForSubmission(
    req: AuthenticatedRequest,
    res: Response,
  ): Promise<void> {
    try {
      const submissionId: number = Number(req.params.submissionId);
      const teacherId: number = getUserFromAuthRequest(req).id;

      const feedback: Feedback | null = await service.getFeedbackForSubmission(
        submissionId,
        teacherId,
      );
      if (feedback) {
        res.status(200).json(feedback);
      } else {
        res.status(404).json({ error: "Feedback not found" });
      }
    } catch (_error) {
      res.status(500).json({ error: "Failed to retrieve feedback" });
    }
  }

  static async updateFeedbackForSubmission(
    req: AuthenticatedRequest,
    res: Response,
  ): Promise<void> {
    try {
      const submissionId: number = Number(req.params.submissionId);
      const teacherId: number = getUserFromAuthRequest(req).id;

      const { description }: { description: string } = req.body;
      const feedback: Feedback = await service.updateFeedbackForSubmission(
        submissionId,
        description,
        teacherId,
      );
      res.json(feedback);
    } catch (_error) {
      res.status(500).json({ error: "Failed to update feedback" });
    }
  }

  static async deleteFeedbackForSubmission(
    req: AuthenticatedRequest,
    res: Response,
  ): Promise<void> {
    try {
      const submissionId: number = Number(req.params.submissionId);
      const teacherId: number = getUserFromAuthRequest(req).id;

      await service.deleteFeedbackForSubmission(submissionId, teacherId);
      // Status 204: successful deletion but no json body returned (no content).
      res.status(204).end();
    } catch (_error) {
      res.status(500).json({ error: "Failed to delete feedback" });
    }
  }
}
