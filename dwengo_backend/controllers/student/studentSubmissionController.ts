import { Response } from "express";
import service from "../../services/submissionService";
import { Submission } from "@prisma/client";
import { AuthenticatedRequest } from "../../interfaces/extendedTypeInterfaces";
import { getUserFromAuthRequest } from "../../helpers/getUserFromAuthRequest";
import asyncHandler from "express-async-handler";

export default class StudentSubmissionController {
  createSubmission = asyncHandler(
    async (req: AuthenticatedRequest, res: Response): Promise<void> => {
      const evaluationId: string = req.params.evaluationId;
      const assignmentId: number = req.params.assignmentId as unknown as number;
      const studentId: number = getUserFromAuthRequest(req).id;

      const submission: Submission = await service.createSubmission(
        studentId,
        evaluationId,
        assignmentId,
      );

      res
        .status(201)
        .json({ message: "Submission successfully created.", submission });
    },
  );

  getSubmissionsForAssignment = asyncHandler(
    async (req: AuthenticatedRequest, res: Response): Promise<void> => {
      const assignmentId: number = req.params.assignmentId as unknown as number;
      const studentId: number = getUserFromAuthRequest(req).id;

      const submissions: Submission[] =
        await service.getSubmissionsForAssignment(assignmentId, studentId);

      res.status(200).json(submissions);
    },
  );

  getSubmissionsForEvaluation = asyncHandler(
    async (req: AuthenticatedRequest, res: Response): Promise<void> => {
      const evaluationId: string = req.params.evaluationId;
      const assignmentId: number = req.params.assignmentId as unknown as number;
      const studentId: number = getUserFromAuthRequest(req).id;

      const submissions: Submission[] =
        await service.getSubmissionsForEvaluation(
          assignmentId,
          evaluationId,
          studentId,
        );

      res.status(200).json(submissions);
    },
  );
}
