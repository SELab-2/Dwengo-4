import {Response} from "express";
import service from "../../services/submissionService";
import {Submission} from "@prisma/client";
import {AuthenticatedRequest} from "../../interfaces/extendedTypeInterfaces";

export default class FeedbackController {
    static async createSubmission(req: AuthenticatedRequest, res: Response) {
        const {assignmentId, evaluationId}: { assignmentId: number, evaluationId: string } = req.params;
        const studentId: number = Number(req.user?.id);
        const submission: Submission = await service.createSubmission(studentId, evaluationId, assignmentId);
        res.status(201).json(submission);
    }

    static async getSubmissionsForAssignment(req: AuthenticatedRequest, res: Response) {
        const assignmentId: number = Number(req.params.assignmentId);
        const studentId: number = Number(req.user?.id);

        const submissions: Submission[] = await service.getSubmissionsForAssignment(assignmentId, studentId);

        res.json(submissions);
    }
}