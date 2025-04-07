import { Request, Response } from "express";
import assignmentService from "../services/assignmentService";
import { Assignment } from "@prisma/client";
import { BadRequestError } from "../errors/errors";

export class AssignmentController {
  async getAssignmentsById(req: Request, res: Response): Promise<void> {
    // 1) Validatie param
    if (!req.params.assignmentId || isNaN(parseInt(req.params.assignmentId))) {
      throw new BadRequestError("Invalid assignment ID.");
    }

    const assignmentId: number = parseInt(req.params.assignmentId);

    // 2) Opvragen assignment (als er geen error wordt opgegooidd, zijn we zeker dat het bestaat)
    const assignment: Assignment =
      await assignmentService.getAssignmentById(assignmentId);

    // 3) OK → 200 + assignment
    res.status(200).json(assignment);
  }
}
