import { Response } from "express";
import service from "../../services/feedbackService";
import { Feedback } from "@prisma/client";
import { AuthenticatedRequest } from "../../interfaces/extendedTypeInterfaces";
import { getUserFromAuthRequest } from "../../helpers/getUserFromAuthRequest";
import asyncHandler from "express-async-handler";

export default class FeedbackController {
  // route: /feedback/assignment/:assignmentId/evaluation/:evaluationId
  // http-command: GET
  getAllFeedbackForEvaluation = asyncHandler(
    async (req: AuthenticatedRequest, res: Response): Promise<void> => {
      const { assignmentId, evaluationId } = req.params;
      const teacherId: number = getUserFromAuthRequest(req).id;

      const feedback: Feedback[] = await service.getAllFeedbackForEvaluation(
        Number(assignmentId),
        evaluationId,
        teacherId,
      );
      res.status(200).json(feedback);
    },
  );

  // route: /feedback/submission/:submissionId
  // http-command: POST
  createFeedback = asyncHandler(
    async (req: AuthenticatedRequest, res: Response): Promise<void> => {
      const teacherId: number = getUserFromAuthRequest(req).id;
      const submissionId: number = Number(req.params.submissionId);

      const description: string = req.body.description;

      const feedback: Feedback = await service.createFeedback(
        submissionId,
        teacherId,
        description,
      );
      res
        .status(201)
        .json({ message: "Feedback successfully created.", feedback });
    },
  );

  // route: /feedback/submission/:submissionId
  // http-command: GET
  getFeedbackForSubmission = asyncHandler(
    async (req: AuthenticatedRequest, res: Response): Promise<void> => {
      const submissionId: number = Number(req.params.submissionId);
      const teacherId: number = getUserFromAuthRequest(req).id;

      const feedback: Feedback = await service.getFeedbackForSubmission(
        submissionId,
        teacherId,
      );
      res.status(200).json(feedback);
    },
  );

  // route: /feedback/submission/:submissionId
  // http-command: PATCH
  updateFeedbackForSubmission = asyncHandler(
    async (req: AuthenticatedRequest, res: Response): Promise<void> => {
      const submissionId: number = Number(req.params.submissionId);
      const teacherId: number = getUserFromAuthRequest(req).id;

      console.log(submissionId);

      const { description }: { description: string } = req.body;
      const feedback: Feedback = await service.updateFeedbackForSubmission(
        submissionId,
        description,
        teacherId,
      );
      res.json({ message: "Feedback successfully updated.", feedback });
    },
  );

  // route: /feedback/submission/:submissionId
  // http-command: DELETE
  deleteFeedbackForSubmission = asyncHandler(
    async (req: AuthenticatedRequest, res: Response): Promise<void> => {
      const submissionId: number = Number(req.params.submissionId);
      const teacherId: number = getUserFromAuthRequest(req).id;

      await service.deleteFeedbackForSubmission(submissionId, teacherId);
      // Status 204: successful deletion but no json body returned (no content).
      res.status(204).json({ message: "Feedback successfully deleted." }).end();
    },
  );
}
