import { Response } from "express";
import { PrismaClient } from "@prisma/client";
import { AuthenticatedRequest } from "../../interfaces/extendedTypeInterfaces";

const prisma = new PrismaClient();

/**
 * Haalt alle teams op waarin de ingelogde student zit.
 */
export const getStudentTeams = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Unauthorized: No user found" });
      return;
    }

    const studentId: number = req.user.id;

    const teams = await prisma.team.findMany({
      where: {
        students: {
          some: { userId: studentId }
        }
      },
      include: {
        teamAssignment: {
          include: {
            assignment: true,
          },
        },
      },
    });

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
    if (!req.user) {
      res.status(401).json({ error: "Unauthorized: No user found" });
      return;
    }

    const studentId: number = req.user.id;
    const assignmentId = parseInt(req.params.assignmentId, 10);

    if (isNaN(assignmentId)) {
      res.status(400).json({ error: "Invalid assignment ID" });
      return;
    }

    const team = await prisma.team.findFirst({
      where: {
        students: {
          some: { userId: studentId }
        },
        teamAssignment: {
          assignmentId: assignmentId,
        }
      },
      include: {
        students: {
          select: {
            userId: true,
            user: { select: { id: true, email: true, firstName: true, lastName: true } }
          }
        },
        teamAssignment: {
          include: {
            assignment: true, // Gebruik de juiste veldnaam
          },
        },
      },
    });

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

    const teamId = parseInt(req.params.teamId, 10);

    if (isNaN(teamId)) {
      res.status(400).json({ error: "Invalid team ID" });
      return;
    }

    const team = await prisma.team.findUnique({
      where: { id: teamId },
      include: {
        students: {
          select: {
            userId: true,
            user: { select: { id: true, email: true, firstName: true, lastName: true } }
          }
        }
      }
    });

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
