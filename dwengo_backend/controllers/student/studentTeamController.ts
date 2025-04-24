import { Response } from "express";
import { Team } from "@prisma/client";
import { AuthenticatedRequest } from "../../interfaces/extendedTypeInterfaces";
import { getUserFromAuthRequest } from "../../helpers/getUserFromAuthRequest";
import StudentTeamService from "../../services/studentTeamService";
import asyncHandler from "express-async-handler";
import { BadRequestError } from "../../errors/errors";

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
    const assignmentId: number = parseInt(req.params.assignmentId, 10);

    if (isNaN(assignmentId)) {
      throw new BadRequestError("Invalid assignment id.");
    }
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
    const teamId: number = parseInt(req.params.teamId, 10);

    if (isNaN(teamId)) {
      throw new BadRequestError("Invalid team id.");
    }
    const team = await StudentTeamService.getTeamById(teamId);
    res.status(200).json(team.students);
  },
);
