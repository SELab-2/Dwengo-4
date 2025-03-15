import { Request, Response } from "express";
import assignmentService from "../services/assignmentService";

export class AssignmentController {
  async getAssignmentsById(req: Request, res: Response): Promise<void> {
    try {
      if (!req.params.assignmentId || isNaN(parseInt(req.params.assignmentId))) {
        res.status(400).json({ error: "Invalid assignment ID" });
        return;
      }
      const assignmentId: number = parseInt(req.params.assignmentId);
      const assignment = await assignmentService.getAssignmentById(assignmentId);
      res.status(200).json(assignment);
    } catch (error) {
      res.status(500).json({ error: "Failed to retrieve assignment" });
    }
  }
}



