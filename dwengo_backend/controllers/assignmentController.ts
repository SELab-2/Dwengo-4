import { Request, Response } from "express";
import assignmentService from "../services/assignmentService";

export class AssignmentController {
    async getAssignmentsById(req: Request, res: Response): Promise<void> {
        try {
            const assignmentId: number = parseInt(req.params.classId);
            const assignments = await assignmentService.getAssignmentById(assignmentId);
            res.status(200).json(assignments);
        } catch (error) {
            res.status(500).json({ error: "Failed to retrieve assignments" });
        }
    }
}
