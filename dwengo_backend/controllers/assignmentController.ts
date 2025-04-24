import { Request, Response } from "express";
import assignmentService from "../services/assignmentService";
import { Assignment } from "@prisma/client";

export class AssignmentController {
  async getAssignmentsById(req: Request, res: Response): Promise<void> {
    try {
      // 1) Validatie param
      if (
        !req.params.assignmentId ||
        isNaN(parseInt(req.params.assignmentId))
      ) {
        res.status(400).json({ error: "Invalid assignment ID" });
        return;
      }

      const assignmentId: number = parseInt(req.params.assignmentId);

      const includeClass = req.query.includeClass === "true";
      const includeTeams = req.query.includeTeams === "true";

      // 2) Opvragen assignment
      const assignment: Assignment | null =
        await assignmentService.getAssignmentById(
          assignmentId,
          includeClass,
          includeTeams,
        );

      // 3) Bestaat het wel?
      if (!assignment) {
        res.status(404).json({ error: "Assignment not found" });
        return;
      }

      // 4) OK → 200 + assignment
      res.status(200).json(assignment);
    } catch {
      res.status(500).json({ error: "Failed to retrieve assignment" });
    }
  }
}
