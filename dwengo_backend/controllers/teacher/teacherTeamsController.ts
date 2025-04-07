import { NextFunction, Response } from "express";
import {
  createTeamsInAssignment,
  getTeamsThatHaveAssignment,
  updateTeamsForAssignment,
  deleteTeam,
} from "../../services/teacherTeamsService";
import { Team } from "@prisma/client";
import { AuthenticatedRequest } from "../../interfaces/extendedTypeInterfaces";
import { convertToNumber } from "../../errors/errorFunctions";

const invalidAssignmentIdMessage = "Invalid assignment id.";

export const createTeamInAssignment = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    // This is guaranteed to be possible by "makeAssignmentIdParamValid" in middleware/teamValidationMiddleware.ts
    const assignmentId: number = convertToNumber(
      req.params.assignmentId,
      invalidAssignmentIdMessage,
    );
    const classId: number = convertToNumber(
      req.params.classId,
      "Invalid class id.",
    );
    const { teams } = req.body;

    const createdTeams: Team[] = await createTeamsInAssignment(
      assignmentId,
      classId,
      teams,
    );
    res.status(201).json({ createdTeams });
  } catch (error) {
    next(error);
  }
};

export const getTeamsInAssignment = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const assignmentId: number = convertToNumber(
      req.params.assignmentId,
      invalidAssignmentIdMessage,
    );
    const teams: Team[] = await getTeamsThatHaveAssignment(assignmentId);
    res.status(200).json(teams);
  } catch (error) {
    next(error);
  }
};

export const updateTeamsInAssignment = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const assignmentId: number = convertToNumber(
      req.params.assignmentId,
      invalidAssignmentIdMessage,
    );
    const { teams } = req.body;

    const updatedTeams: Team[] = await updateTeamsForAssignment(
      assignmentId,
      teams,
    );
    res.status(200).json(updatedTeams);
  } catch (error) {
    next(error);
  }
};

export const deleteTeamInAssignment = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    // This is guaranteed to be possible by "makeTeamIdParamValid" in middleware/teamValidationMiddleware.ts
    const teamId: number = convertToNumber(
      req.params.teamId,
      "Invalid team id.",
    );

    await deleteTeam(teamId);
    res.status(200).json({ message: "Team successfully deleted." });
  } catch (error) {
    next(error);
  }
};
