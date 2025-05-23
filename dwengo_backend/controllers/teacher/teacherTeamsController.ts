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
import { handlePrismaTransaction } from "../../errors/errorFunctions";
import prisma from "../../config/prisma";

export const createTeamInAssignment = asyncHandler(
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    // This is guaranteed to be possible by "makeAssignmentIdParamValid" in middleware/teamValidationMiddleware.ts
    const assignmentId: number = req.params.assignmentId as unknown as number;
    const classId: number = req.params.classId as unknown as number;
    const { teams } = req.body;

    const createdTeams: Team[] = await handlePrismaTransaction(
      prisma,
      async (tx) => {
        return await createTeamsInAssignment(assignmentId, classId, teams, tx);
      },
    );

    res.status(201).json({
      message: "Teams successfully created.",
      createdTeams,
    });
  },
);

export const getTeamsInAssignment = asyncHandler(
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const assignmentId: number = req.params.assignmentId as unknown as number;
    const teams: Team[] = await getTeamsThatHaveAssignment(assignmentId);
    res.status(200).json(teams);
  },
);

export const updateTeamsInAssignment = asyncHandler(
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const assignmentId: number = req.params.assignmentId as unknown as number;
    const { teams } = req.body;

    const updatedTeams: Team[] = await updateTeamsForAssignment(
      assignmentId,
      teams,
    );
    res.status(200).json({
      message: "Teams successfully updated.",
      updatedTeams: updatedTeams,
    });
  },
);

export const deleteTeamInAssignment = asyncHandler(
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const teamId: number = req.params.teamId as unknown as number;

    await deleteTeam(teamId);
    res.status(204).end();
  },
);
