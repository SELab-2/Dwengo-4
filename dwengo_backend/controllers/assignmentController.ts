import { Request, Response } from "express";
import assignmentService from "../services/assignmentService";

export class AssignmentController {
    async getAssignmentsById(req: Request, res: Response): Promise<void> {
        try {
            if (!req.params.assignmentId || isNaN(parseInt(req.params.assignmentId))) {
                res.status(400).json({ error: "Invalid class ID" });
                return;
            }
            const assignmentId: number = parseInt(req.params.assignmentId);
            const assignments = await assignmentService.getAssignmentById(assignmentId);
            res.status(200).json(assignments);
        } catch (error) {
            res.status(500).json({ error: "Failed to retrieve assignments" });
        }
    }
}
