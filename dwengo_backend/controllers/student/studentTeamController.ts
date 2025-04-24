import { Response } from "express";
import { Team } from "@prisma/client";
import { AuthenticatedRequest } from "../../interfaces/extendedTypeInterfaces";
import { getUserFromAuthRequest } from "../../helpers/getUserFromAuthRequest";
import StudentTeamService from "../../services/studentTeamService";

/**
 * Haalt alle teams op waarin de ingelogde student zit.
 */
export const getStudentTeams = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const studentId: number = getUserFromAuthRequest(req).id;

    const teams: Team[] = await StudentTeamService.getStudentTeams(studentId);

    res.status(200).json(teams);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Er is iets misgegaan bij het ophalen van de teams." });
  }
};

/**
 * Haalt het team op dat gekoppeld is aan een specifieke opdracht.
 */
export const getTeamByAssignment = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const studentId: number = getUserFromAuthRequest(req).id;
    const assignmentId: number = parseInt(req.params.assignmentId, 10);

    if (isNaN(assignmentId)) {
      res.status(400).json({ error: "Invalid assignment ID" });
      return;
    }

    const team = await StudentTeamService.getTeam(studentId, assignmentId);

    if (!team) {
      res.status(404).json({ error: "Geen team gevonden voor deze opdracht." });
      return;
    }

    res.status(200).json(team);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Er is iets misgegaan bij het ophalen van het team." });
  }
};

/**
 * Haalt alle teamleden op van een specifiek team.
 */
export const getTeamMembers = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Unauthorized: No user found" });
      return;
    }

    const teamId: number = parseInt(req.params.teamId, 10);

    if (isNaN(teamId)) {
      res.status(400).json({ error: "Invalid team ID" });
      return;
    }

    const team = await StudentTeamService.getTeamById(teamId);

    if (!team) {
      res.status(404).json({ error: "Team niet gevonden." });
      return;
    }

    res.status(200).json(team.students);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Er is iets misgegaan bij het ophalen van de teamleden." });
  }
};
