import { Request, Response } from "express";
import assignmentService from "../services/assignmentService";
import { Assignment } from "@prisma/client";
import asyncHandler from "express-async-handler";

export class AssignmentController {
  getAssignmentsById = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      // 1) Validatie param
      const assignmentId: number = parseInt(req.params.assignmentId);

      const includeClass = req.query.includeClass === "true";
      const includeTeams = req.query.includeTeams === "true";

      // 2) Opvragen assignment (als er geen error wordt opgegooid, zijn we zeker dat het bestaat)
      const assignment: Assignment = await assignmentService.getAssignmentById(
        assignmentId,
        includeClass,
        includeTeams
      );

      // 3) OK → 200 + assignment
      res.status(200).json(assignment);
    }
  );
}
