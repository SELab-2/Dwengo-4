import {NextFunction, Response} from "express";
import service from "../../services/submissionService";
import {Submission} from "@prisma/client";
import {AuthenticatedRequest} from "../../interfaces/extendedTypeInterfaces";
import {getUserFromAuthRequest} from "../../helpers/getUserFromAuthRequest";

export default class StudentSubmissionController {
    static async createSubmission(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
        // Hier is het noodzakelijk om de error aan next door te geven, anders vangt onze errorhandler deze nooit op.
        try {
            const { assignmentId, evaluationId } = req.params;
            const studentId: number = getUserFromAuthRequest(req).id;

            const submission: Submission = await service.createSubmission(studentId, evaluationId, Number(assignmentId));
            res.status(201).json(submission);
        } catch (err) {
            // Pass the error to the next middleware (our error handler)
            next(err);
        }
    }

    static async getSubmissionsForAssignment(req: AuthenticatedRequest, res: Response): Promise<void> {
        const assignmentId: number = Number(req.params.assignmentId);
        const studentId: number = getUserFromAuthRequest(req).id;

        const submissions: Submission[] = await service.getSubmissionsForAssignment(assignmentId, studentId);

        res.status(200).json(submissions);
    }

    static async getSubmissionsForEvaluation(req: AuthenticatedRequest, res: Response): Promise<void> {
        const {assignmentId, evaluationId} = req.params;
        const studentId: number = getUserFromAuthRequest(req).id;

        const submissions: Submission[] = await service.getSubmissionsForEvaluation(Number(assignmentId), evaluationId, studentId);

        res.status(200).json(submissions);
    }
}