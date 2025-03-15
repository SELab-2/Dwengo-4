import { Response } from "express";
import {Assignment, LearningObjectProgress, PrismaClient} from "@prisma/client";
import { AuthenticatedRequest } from "../interfaces/extendedTypeInterfaces";
import {getUserFromAuthRequest} from "../helpers/getUserFromAuthRequest";

const prisma = new PrismaClient();

/**
 * Creëert een nieuw progressie-record voor een student bij een leerobject.
 * Dit gebeurt wanneer een student een leerobject start.
 */
export const createProgress = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    // Controleer of de student is ingelogd
    const studentId: number = getUserFromAuthRequest(req).id;
    const learningObjectId: string = req.params.learningObjectId; // Het ID van het leerobject

    // Gebruik een transactie om de progressie en de koppeling aan de student in één atomaire actie uit te voeren
    const result = await prisma.$transaction(async (prisma) => {
      // Maak een nieuw progressie-record (aanvankelijk niet voltooid)
      const progress: LearningObjectProgress = await prisma.learningObjectProgress.create({
        data: {
          learningObjectId,
          done: false,
        },
      });

      // Koppel de progressie aan de ingelogde student
      await prisma.studentProgress.create({
        data: {
          studentId: studentId,
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
 * Haalt het progressie-record op van een student voor een specifiek leerobject.
 */
export const getStudentProgress = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    // Controleer of de student is ingelogd
    const studentId: number = getUserFromAuthRequest(req).id;
    const { learningObjectId } = req.params;
    // Zoek het progressie-record gekoppeld aan de student en het leerobject
    const studentProgress = await prisma.studentProgress.findFirst({
      where: {
        studentId: studentId,
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
 * Update het progressie-record van een student voor een leerobject.
 * Bijvoorbeeld: markeer een leerobject als voltooid.
 */
export const updateProgress = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    // Zorg dat de student is ingelogd
    const studentId: number = getUserFromAuthRequest(req).id;
    const { learningObjectId } = req.params;
    // Zoek het relevante progressie-record
    const studentProgress = await prisma.studentProgress.findFirst({
      where: {
        studentId: studentId,
        progress: { learningObjectId }
      },
      include: { progress: true }
    });
    if (!studentProgress) {
      res.status(404).json({ error: "Progressie niet gevonden." });
      return;
    }
    // Update het record, bv. door 'done' op true te zetten
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
 * Bereken de voortgang van een team voor een opdracht (student-versie).
 * De voortgang wordt bepaald als het hoogste percentage afgeronde leerobjecten van de teamleden.
 */
export const getTeamProgressStudent = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    // Controleer of de student is ingelogd
    if (!req.user) {
      res.status(401).json({ error: "Niet ingelogd." });
      return;
    }
    const teamId: number = parseInt(req.params.teamid, 10);
    if (isNaN(teamId)) {
      res.status(400).json({ error: "Ongeldig team ID." });
      return;
    }
    // Haal het team op met de studenten en de gekoppelde assignment (via teamAssignment)
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
    // Zorg dat er een assignment is gekoppeld aan het team
    const teamAssignment = team.teamAssignment;
    if (!teamAssignment) {
      res.status(404).json({ error: "Geen assignment gekoppeld aan dit team." });
      return;
    }
    // Haal de opdracht op op basis van de assignment ID
    const assignment: Assignment | null = await prisma.assignment.findUnique({
      where: { id: teamAssignment.assignmentId }
    });
    if (!assignment) {
      res.status(404).json({ error: "Opdracht niet gevonden." });
      return;
    }
    const { learningPathId } = assignment;
    // Bepaal het aantal nodes in het leerpad
    const totalNodes: number = await prisma.learningPathNode.count({
      where: { learningPathId }
    });
    if (totalNodes === 0) {
      res.status(404).json({ error: "Geen leerpad nodes gevonden." });
      return;
    }
    // Haal de leerobjecten op die bij het leerpad horen
    const nodes: {learningObjectId: string}[] = await prisma.learningPathNode.findMany({
      where: { learningPathId },
      select: { learningObjectId: true }
    });
    const learningObjectIds: string[] = nodes.map((n: {learningObjectId: string}): string => n.learningObjectId);
    // Bepaal per teamlid het percentage afgeronde leerobjecten en neem het maximum
    let maxPercentage: number = 0;
    for (const student of team.students) {
      const doneCount: number = await prisma.studentProgress.count({
        where: {
          studentId: student.userId, // 'userId' is de primaire sleutel in het Student-model
          progress: {
            done: true,
            learningObjectId: { in: learningObjectIds }
          }
        }
      });
      const percentage: number = (doneCount / totalNodes) * 100;
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
 * Bereken de voortgang van de ingelogde student voor een specifieke opdracht.
 * Het percentage wordt berekend op basis van het aantal afgeronde leerobjecten binnen het leerpad.
 */
export const getStudentAssignmentProgress = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const studentId: number = getUserFromAuthRequest(req).id;
    const assignmentId: number = parseInt(req.params.assignmentId, 10);
    if (isNaN(assignmentId)) {
      res.status(400).json({ error: "Ongeldig opdracht ID." });
      return;
    }
    const assignment: Assignment | null = await prisma.assignment.findUnique({
      where: { id: assignmentId }
    });
    if (!assignment) {
      res.status(404).json({ error: "Opdracht niet gevonden." });
      return;
    }
    const { learningPathId } = assignment;
    // Tellen van het totaal aantal nodes in het leerpad
    const totalNodes: number = await prisma.learningPathNode.count({
      where: { learningPathId }
    });
    if (totalNodes === 0) {
      res.status(404).json({ error: "Geen leerpad nodes gevonden." });
      return;
    }
    // Haal de leerobjecten op die bij het leerpad horen
    const nodes: {learningObjectId: string}[] = await prisma.learningPathNode.findMany({
      where: { learningPathId },
      select: { learningObjectId: true }
    });
    const learningObjectIds: string[] = nodes.map((n: {learningObjectId: string}): string => n.learningObjectId);
    // Bepaal hoeveel leerobjecten de student heeft afgerond
    const doneCount: number = await prisma.studentProgress.count({
      where: {
        studentId: studentId,
        progress: {
          done: true,
          learningObjectId: { in: learningObjectIds }
        }
      }
    });
    const percentage: number = (doneCount / totalNodes) * 100;
    res.status(200).json({ assignmentProgress: percentage });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Fout bij ophalen van opdracht voortgang." });
  }
};

/**
 * Bereken de voortgang van de ingelogde student voor een volledig leerpad.
 * Het resultaat is het percentage afgeronde leerobjecten.
 */
export const getStudentLearningPathProgress = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const studentId: number = getUserFromAuthRequest(req).id;
    const { learningPathId } = req.params;
    if (!learningPathId) {
      res.status(400).json({ error: "Ongeldig leerpad ID." });
      return;
    }
    // Tel het aantal nodes in het leerpad
    const totalNodes: number = await prisma.learningPathNode.count({
      where: { learningPathId }
    });
    if (totalNodes === 0) {
      res.status(404).json({ error: "Geen nodes gevonden voor dit leerpad." });
      return;
    }
    // Haal de leerobjecten op
    const nodes: {learningObjectId: string}[] = await prisma.learningPathNode.findMany({
      where: { learningPathId },
      select: { learningObjectId: true }
    });
    const learningObjectIds: string[] = nodes.map((n: {learningObjectId: string}): string => n.learningObjectId);
    // Tel hoeveel leerobjecten de student heeft afgerond
    const doneCount: number = await prisma.studentProgress.count({
      where: {
        studentId: studentId,
        progress: {
          done: true,
          learningObjectId: { in: learningObjectIds }
        }
      }
    });
    const percentage: number = (doneCount / totalNodes) * 100;
    res.status(200).json({ learningPathProgress: percentage });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Fout bij ophalen van leerpad voortgang." });
  }
};

/**
 * Bereken de teamvoortgang voor een opdracht (docent-versie).
 * Hierbij wordt per team de hoogste voortgang van de teamleden berekend.
 */
export const getTeamProgressTeacher = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Niet ingelogd." });
      return;
    }
    const teamId: number = parseInt(req.params.teamid, 10);
    if (isNaN(teamId)) {
      res.status(400).json({ error: "Ongeldig team ID." });
      return;
    }
    // Haal het team met studenten en gekoppelde assignment op
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
    // Haal de opdracht op
    const assignment: Assignment | null = await prisma.assignment.findUnique({
      where: { id: teamAssignment.assignmentId }
    });
    if (!assignment) {
      res.status(404).json({ error: "Opdracht niet gevonden." });
      return;
    }
    const { learningPathId } = assignment;
    // Bepaal het totaal aantal nodes
    const totalNodes = await prisma.learningPathNode.count({
      where: { learningPathId }
    });
    if (totalNodes === 0) {
      res.status(404).json({ error: "Geen leerpad nodes gevonden." });
      return;
    }
    // Haal de leerobjecten op
    const nodes = await prisma.learningPathNode.findMany({
      where: { learningPathId },
      select: { learningObjectId: true }
    });
    const learningObjectIds = nodes.map(n => n.learningObjectId);
    // Bepaal de maximale voortgang binnen het team
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
 * Bereken de gemiddelde voortgang van een klas voor een opdracht.
 * Per team wordt de hoogste voortgang bepaald en daarna het gemiddelde berekend.
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
    // Tel het aantal nodes in het leerpad
    const totalNodes = await prisma.learningPathNode.count({
      where: { learningPathId }
    });
    if (totalNodes === 0) {
      res.status(404).json({ error: "Geen leerpad nodes gevonden." });
      return;
    }
    // Haal de leerobjecten op
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
    // Voor elk team: bepaal de hoogste voortgang binnen het team
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
