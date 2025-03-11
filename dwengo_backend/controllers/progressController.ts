import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { AuthenticatedRequest } from "../interfaces/extendedTypeInterfaces";

const prisma = new PrismaClient();

/**
 * Een nieuwe progressie aanmaken voor een student bij een leerobject.
 * Dit wordt gebruikt wanneer een student een nieuw leerobject start.
 */
export const createProgress = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Niet ingelogd." });
      return;
    }
    const learningObjectId = req.params.learningObjectId; // learningObjectId is een string

    // Gebruik een Prisma-transactie om beide operaties in één atomaire actie te verpakken
    const result = await prisma.$transaction(async (prisma) => {
      // Maak een progressie-record (aanvankelijk niet voltooid)
      const progress = await prisma.learningObjectProgress.create({
        data: {
          learningObjectId,
          done: false,
        },
      });

      // Koppel deze progressie aan de leerling
      await prisma.studentProgress.create({
        data: {
          studentId: req.user.id,
          progressId: progress.id,
        },
      });

      return { progress };
    });

    res.status(201).json({ message: "Progressie aangemaakt.", progress: result.progress });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Er is iets misgegaan bij het aanmaken van progressie." });
  }
};

/**
 * Haal de huidige progressie op van een student voor een specifiek leerobject.
 */
export const getStudentProgress = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Niet ingelogd." });
      return;
    }
    const { learningObjectId } = req.params;
    const studentProgress = await prisma.studentProgress.findFirst({
      where: {
        studentId: req.user.id,
        progress: { learningObjectId }
      },
      include: { progress: true }
    });
    if (!studentProgress) {
      res.status(404).json({ error: "Progressie niet gevonden." });
      return;
    }
    res.status(200).json(studentProgress.progress);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Fout bij ophalen van progressie." });
  }
};

/**
 * Werk de progressie van een student bij voor een leerobject.
 * Bijvoorbeeld: markeer een leerobject als voltooid.
 */
export const updateProgress = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Niet ingelogd." });
      return;
    }
    const { learningObjectId } = req.params;
    // Zoek het progressierecord voor de ingelogde student en dit leerobject
    const studentProgress = await prisma.studentProgress.findFirst({
      where: {
        studentId: req.user.id,
        progress: { learningObjectId }
      },
      include: { progress: true }
    });
    if (!studentProgress) {
      res.status(404).json({ error: "Progressie niet gevonden." });
      return;
    }
    // Update de progressie (bijvoorbeeld: markeer als voltooid)
    const updatedProgress = await prisma.learningObjectProgress.update({
      where: { id: studentProgress.progress.id },
      data: { done: true }
    });
    res.status(200).json({ message: "Progressie bijgewerkt.", progress: updatedProgress });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Fout bij bijwerken van progressie." });
  }
};

/**
 * Haal de voortgang van een team op voor een specifieke opdracht (student-versie).
 * Hierbij wordt de progressie berekend als het hoogste percentage afgeronde leerobjecten
 * van de teamleden, op basis van het leerpad dat gekoppeld is aan de (enige) assignment van het team.
 */
export const getTeamProgressStudent = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Niet ingelogd." });
      return;
    }
    const teamId = parseInt(req.params.teamid, 10);
    if (isNaN(teamId)) {
      res.status(400).json({ error: "Ongeldig team ID." });
      return;
    }
    // Haal het team op met de gekoppelde studenten en de assignment via teamAssignment
    const team = await prisma.team.findUnique({
      where: { id: teamId },
      include: {
        students: true,
        teamAssignment: true
      }
    });
    if (!team) {
      res.status(404).json({ error: "Team niet gevonden." });
      return;
    }
    // Omdat een team maar één assignment kan hebben, halen we deze direct op
    const teamAssignment = team.teamAssignment;
    if (!teamAssignment) {
      res.status(404).json({ error: "Geen assignment gekoppeld aan dit team." });
      return;
    }
    const assignment = await prisma.assignment.findUnique({
      where: { id: teamAssignment.assignmentId }
    });
    if (!assignment) {
      res.status(404).json({ error: "Opdracht niet gevonden." });
      return;
    }
    const { learningPathId } = assignment;
    // Bepaal het totaal aantal nodes binnen het leerpad
    const totalNodes = await prisma.learningPathNode.count({
      where: { learningPathId }
    });
    if (totalNodes === 0) {
      res.status(404).json({ error: "Geen leerpad nodes gevonden." });
      return;
    }
    // Haal alle leerobject-id's op die horen bij het leerpad
    const nodes = await prisma.learningPathNode.findMany({
      where: { learningPathId },
      select: { learningObjectId: true }
    });
    const learningObjectIds = nodes.map(n => n.learningObjectId);
    // Bereken voor elk teamlid het percentage afgeronde leerobjecten
    let maxPercentage = 0;
    for (const student of team.students) {
      const doneCount = await prisma.studentProgress.count({
        where: {
          studentId: student.userId, // In het Student-model is userId de primaire sleutel
          progress: {
            done: true,
            learningObjectId: { in: learningObjectIds }
          }
        }
      });
      const percentage = (doneCount / totalNodes) * 100;
      if (percentage > maxPercentage) {
        maxPercentage = percentage;
      }
    }
    res.status(200).json({ teamProgress: maxPercentage });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Fout bij ophalen van team progressie." });
  }
};

/**
 * Haal de voortgang op van de ingelogde student voor een specifieke opdracht.
 * De voortgang wordt berekend als percentage afgeronde leerobjecten binnen het leerpad.
 */
export const getStudentAssignmentProgress = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Niet ingelogd." });
      return;
    }
    const assignmentId = parseInt(req.params.assignmentId, 10);
    if (isNaN(assignmentId)) {
      res.status(400).json({ error: "Ongeldig opdracht ID." });
      return;
    }
    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId }
    });
    if (!assignment) {
      res.status(404).json({ error: "Opdracht niet gevonden." });
      return;
    }
    const { learningPathId } = assignment;
    const totalNodes = await prisma.learningPathNode.count({
      where: { learningPathId }
    });
    if (totalNodes === 0) {
      res.status(404).json({ error: "Geen leerpad nodes gevonden." });
      return;
    }
    const nodes = await prisma.learningPathNode.findMany({
      where: { learningPathId },
      select: { learningObjectId: true }
    });
    const learningObjectIds = nodes.map(n => n.learningObjectId);
    const doneCount = await prisma.studentProgress.count({
      where: {
        studentId: req.user.id,
        progress: {
          done: true,
          learningObjectId: { in: learningObjectIds }
        }
      }
    });
    const percentage = (doneCount / totalNodes) * 100;
    res.status(200).json({ assignmentProgress: percentage });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Fout bij ophalen van opdracht voortgang." });
  }
};

/**
 * Haal de voortgang op van de ingelogde student voor een specifiek leerpad.
 * De voortgang wordt berekend als percentage afgeronde leerobjecten binnen dat leerpad.
 */
export const getStudentLearningPathProgress = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Niet ingelogd." });
      return;
    }
    const { learningPathId } = req.params;
    if (!learningPathId) {
      res.status(400).json({ error: "Ongeldig leerpad ID." });
      return;
    }
    const totalNodes = await prisma.learningPathNode.count({
      where: { learningPathId }
    });
    if (totalNodes === 0) {
      res.status(404).json({ error: "Geen nodes gevonden voor dit leerpad." });
      return;
    }
    const nodes = await prisma.learningPathNode.findMany({
      where: { learningPathId },
      select: { learningObjectId: true }
    });
    const learningObjectIds = nodes.map(n => n.learningObjectId);
    const doneCount = await prisma.studentProgress.count({
      where: {
        studentId: req.user.id,
        progress: {
          done: true,
          learningObjectId: { in: learningObjectIds }
        }
      }
    });
    const percentage = (doneCount / totalNodes) * 100;
    res.status(200).json({ learningPathProgress: percentage });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Fout bij ophalen van leerpad voortgang." });
  }
};

/**
 * Haal de voortgang van een team op voor een specifieke opdracht (docent-versie).
 * De berekening is vergelijkbaar met de student-versie, maar hierbij hoeft de docent niet
 * lid te zijn van het team.
 */
export const getTeamProgressTeacher = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Niet ingelogd." });
      return;
    }
    const teamId = parseInt(req.params.teamid, 10);
    if (isNaN(teamId)) {
      res.status(400).json({ error: "Ongeldig team ID." });
      return;
    }
    // Haal het team op met de gekoppelde studenten en de assignment via teamAssignment
    const team = await prisma.team.findUnique({
      where: { id: teamId },
      include: {
        students: true,
        teamAssignment: true
      }
    });
    if (!team) {
      res.status(404).json({ error: "Team niet gevonden." });
      return;
    }
    const teamAssignment = team.teamAssignment;
    if (!teamAssignment) {
      res.status(404).json({ error: "Geen assignment gekoppeld aan dit team." });
      return;
    }
    const assignment = await prisma.assignment.findUnique({
      where: { id: teamAssignment.assignmentId }
    });
    if (!assignment) {
      res.status(404).json({ error: "Opdracht niet gevonden." });
      return;
    }
    const { learningPathId } = assignment;
    const totalNodes = await prisma.learningPathNode.count({
      where: { learningPathId }
    });
    if (totalNodes === 0) {
      res.status(404).json({ error: "Geen leerpad nodes gevonden." });
      return;
    }
    const nodes = await prisma.learningPathNode.findMany({
      where: { learningPathId },
      select: { learningObjectId: true }
    });
    const learningObjectIds = nodes.map(n => n.learningObjectId);
    let maxPercentage = 0;
    for (const student of team.students) {
      const doneCount = await prisma.studentProgress.count({
        where: {
          studentId: student.userId,
          progress: {
            done: true,
            learningObjectId: { in: learningObjectIds }
          }
        }
      });
      const percentage = (doneCount / totalNodes) * 100;
      if (percentage > maxPercentage) {
        maxPercentage = percentage;
      }
    }
    res.status(200).json({ teamProgress: maxPercentage });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Fout bij ophalen van team progressie." });
  }
};

/**
 * Bereken de gemiddelde voortgang van een klas bij een opdracht.
 * Voor elk team wordt de verste voortgang (het hoogste percentage afgeronde leerobjecten)
 * berekend en vervolgens wordt het gemiddelde over alle teams berekend.
 */
export const getAssignmentAverageProgress = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Niet ingelogd." });
      return;
    }
    const assignmentId = parseInt(req.params.assignmentId, 10);
    if (isNaN(assignmentId)) {
      res.status(400).json({ error: "Ongeldig opdracht ID." });
      return;
    }
    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId }
    });
    if (!assignment) {
      res.status(404).json({ error: "Opdracht niet gevonden." });
      return;
    }
    const { learningPathId } = assignment;
    const totalNodes = await prisma.learningPathNode.count({
      where: { learningPathId }
    });
    if (totalNodes === 0) {
      res.status(404).json({ error: "Geen leerpad nodes gevonden." });
      return;
    }
    const nodes = await prisma.learningPathNode.findMany({
      where: { learningPathId },
      select: { learningObjectId: true }
    });
    const learningObjectIds = nodes.map(n => n.learningObjectId);
    // Haal alle team assignments op voor deze opdracht
    const teamAssignments = await prisma.teamAssignment.findMany({
      where: { assignmentId },
      include: {
        team: { include: { students: true } }
      }
    });
    if (teamAssignments.length === 0) {
      res.status(404).json({ error: "Geen teams gevonden voor deze opdracht." });
      return;
    }
    let totalProgress = 0;
    let teamCount = 0;
    // Voor elk team: bepaal de verste voortgang (het hoogste percentage afgeronde leerobjecten van de teamleden)
    for (const ta of teamAssignments) {
      const team = ta.team;
      let teamMax = 0;
      for (const student of team.students) {
        const doneCount = await prisma.studentProgress.count({
          where: {
            studentId: student.userId,
            progress: {
              done: true,
              learningObjectId: { in: learningObjectIds }
            }
          }
        });
        const percentage = (doneCount / totalNodes) * 100;
        if (percentage > teamMax) {
          teamMax = percentage;
        }
      }
      totalProgress += teamMax;
      teamCount++;
    }
    const averageProgress = totalProgress / teamCount;
    res.status(200).json({ averageProgress });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Fout bij berekenen van gemiddelde voortgang." });
  }
};
