import { Response } from "express";
import {
  createTeamsInAssignment,
  getTeamsThatHaveAssignment,
  updateTeamsForAssignment,
  deleteTeam,
} from "../../services/teacherTeamsService";
import { Team } from "@prisma/client";
import { AuthenticatedRequest } from "../../interfaces/extendedTypeInterfaces";

export const createTeamInAssignment = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  // This is guaranteed to be possible by "makeAssignmentIdParamValid" in middleware/teamValidationMiddleware.ts
  const assignmentId: number = Number(req.params.assignmentId);
  const classId: number = Number(req.params.classId);
  const { teams } = req.body;

  const createdTeams: Team[] = await createTeamsInAssignment(
    assignmentId,
    classId,
    teams
  );
  res.status(201).json({ createdTeams });
};

export const getTeamsInAssignment = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const assignmentId: number = Number(req.params.assignmentId);
    const teams: Team[] = await getTeamsThatHaveAssignment(assignmentId);
    res.status(200).json(teams);
  } catch (error) {
    res.status(500).json({ error: "Error fetching teams for assignment." });
  }
};

export const updateTeamsInAssignment = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const assignmentId: number = Number(req.params.assignmentId);
    const { teams } = req.body;

    const updatedTeams: Team[] = await updateTeamsForAssignment(
      assignmentId,
      teams
    );
    res.status(200).json(updatedTeams);
  } catch (error) {
    res.status(500).json({ error: "Error updating teams for assignment." });
  }
};

export const deleteTeamInAssignment = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    // This is guaranteed to be possible by "makeTeamIdParamValid" in middleware/teamValidationMiddleware.ts
    const teamId: number = Number(req.params.teamId);

    await deleteTeam(teamId);
    res.status(200).json({ message: "Team successfully deleted." });
  } catch (error) {
    res.status(500).json({ error: "Error deleting team from assignment." });
  }
};
