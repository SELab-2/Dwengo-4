import { Response } from "express";
import { Team } from "@prisma/client";
import { AuthenticatedRequest } from "../../interfaces/extendedTypeInterfaces";
import { getUserFromAuthRequest } from "../../helpers/getUserFromAuthRequest";
import StudentTeamService from "../../services/studentTeamService";
import asyncHandler from "express-async-handler";

/**
 * Haalt alle teams op waarin de ingelogde student zit.
 */
export const getStudentTeams = asyncHandler(
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const studentId: number = getUserFromAuthRequest(req).id;
    const teams: Team[] = await StudentTeamService.getStudentTeams(studentId);
    res.status(200).json(teams);
  },
);

/**
 * Haalt het team op dat gekoppeld is aan een specifieke opdracht.
 */
export const getTeamByAssignment = asyncHandler(
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const studentId: number = getUserFromAuthRequest(req).id;
    const assignmentId: number = req.params.assignmentId as unknown as number;

    const team = await StudentTeamService.getTeam(studentId, assignmentId);
    res.status(200).json(team);
  },
);

/**
 * Haalt alle teamleden op van een specifiek team.
 */
export const getTeamMembers = asyncHandler(
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    // Check if there is a user
    getUserFromAuthRequest(req);
    const teamId: number = req.params.teamId as unknown as number;

    const team = await StudentTeamService.getTeamById(teamId);
    res.status(200).json(team.students);
  },
);
