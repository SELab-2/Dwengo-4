import { NextFunction, Request, Response } from "express";
import assignmentService from "../services/assignmentService";
import { Assignment } from "@prisma/client";
import { convertToNumber } from "../errors/errorFunctions";

export class AssignmentController {
  async getAssignmentsById(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      // 1) Validatie param
      const assignmentId: number = convertToNumber(
        req.params.assignmentId,
        "Invalid assignment ID.",
      );

      // 2) Opvragen assignment (als er geen error wordt opgegooid, zijn we zeker dat het bestaat)
      const assignment: Assignment =
        await assignmentService.getAssignmentById(assignmentId);

      // 3) OK → 200 + assignment
      res.status(200).json(assignment);
    } catch (error) {
      // Stuur error door naar error middleware
      next(error);
    }
  }
}
