import { Response } from "express";
import {
  createTeamsInAssignment,
  getTeamsThatHaveAssignment,
  updateTeamsForAssignment,
  deleteTeam,
} from "../../services/teacherTeamsService";
import asyncHandler from "express-async-handler";
import { Team } from "@prisma/client";
import { AuthenticatedRequest } from "../../interfaces/extendedTypeInterfaces";

export const createTeamInAssignment = asyncHandler(
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    // This is guaranteed to be possible by "makeAssignmentIdParamValid" in middleware/teamValidationMiddleware.ts
    const assignmentId: number = Number(req.params.assignmentId);
    const classId: number = Number(req.params.classId);
    const { teams } = req.body;

    const createdTeams: Team[] = await createTeamsInAssignment(
      assignmentId,
      classId,
      teams
    );
    res.status(201).json({
      message: "Teams successfully created.",
      createdTeams,
    });
  }
);

export const getTeamsInAssignment = asyncHandler(
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const assignmentId: number = Number(req.params.assignmentId);
    const teams: Team[] = await getTeamsThatHaveAssignment(assignmentId);
    res.status(200).json(teams);
  }
);

export const updateTeamsInAssignment = asyncHandler(
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const assignmentId: number = Number(req.params.assignmentId);
    const { teams } = req.body;

    const updatedTeams: Team[] = await updateTeamsForAssignment(
      assignmentId,
      teams
    );
    res.status(200).json({
      message: "Teams successfully updated.",
      updatedTeams: updatedTeams,
    });
  }
);

export const deleteTeamInAssignment = asyncHandler(
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    // This is guaranteed to be possible by "makeTeamIdParamValid" in middleware/teamValidationMiddleware.ts
    const teamId: number = Number(req.params.teamId);

    await deleteTeam(teamId);
    res.status(204).end();
  }
);
