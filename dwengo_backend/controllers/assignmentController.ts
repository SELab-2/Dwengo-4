import { Request, Response } from "express";
import assignmentService from "../services/assignmentService";
import {Assignment} from "@prisma/client";

export class AssignmentController {
    async getAssignmentsById(req: Request, res: Response): Promise<void> {
        try {
            if (!req.params.assignmentId || isNaN(parseInt(req.params.assignmentId))) {
                res.status(400).json({ error: "Invalid class ID" });
                return;
            }
            const assignmentId: number = parseInt(req.params.assignmentId);
            const assignment: Assignment | null = await assignmentService.getAssignmentById(assignmentId);

            if (!assignment) {
                res.status(404).json({ error: "Assignment not found" });
                return;
            }

            res.status(200).json(assignment);
        } catch (error) {
            res.status(500).json({ error: "Failed to retrieve assignments" });
        }
    }
}
