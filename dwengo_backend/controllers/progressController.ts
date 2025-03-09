import { Response } from "express";
import { PrismaClient } from "@prisma/client";
import { AuthenticatedRequest } from "../interfaces/extendedTypeInterfaces";

const prisma = new PrismaClient();

/**
 * POST /progress/:learningObjectId
 * Start een leerobject → maak progressie aan.
 */
export const createProgress = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Niet ingelogd." });
      return;
    }
    const learningObjectId = req.params.learningObjectId; // learningObjectId is een string
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
    res.status(201).json({ message: "Progressie aangemaakt.", progress });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Er is iets misgegaan bij het aanmaken van progressie." });
  }
};

/**
 * GET /progress/:learningObjectId
 * Haal jouw progressie op voor een specifiek leerobject.
 */
export const getStudentProgress = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Niet ingelogd." });
      return;
    }
    const learningObjectId = req.params.learningObjectId;
    const studentProgress = await prisma.studentProgress.findFirst({
      where: {
        studentId: req.user.id,
        progress: { learningObjectId },
      },
      include: {
        progress: true,
      },
    });
    if (!studentProgress) {
      res.status(404).json({ error: "Geen progressie gevonden." });
      return;
    }
    res.status(200).json(studentProgress);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Er is iets misgegaan bij het ophalen van jouw progressie." });
  }
};

/**
 * PUT /progress/:learningObjectId
 * Update jouw progressie (bijv. markeer een leerobject als voltooid).
 */
export const updateProgress = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Niet ingelogd." });
      return;
    }
    const learningObjectId = req.params.learningObjectId;
    const { done } = req.body;
    if (typeof done !== "boolean") {
      res.status(400).json({ error: "done moet een boolean zijn." });
      return;
    }
    // Zoek de progressie voor deze leerling en leerobject
    const studentProgress = await prisma.studentProgress.findFirst({
      where: {
        studentId: req.user.id,
        progress: { learningObjectId },
      },
      include: { progress: true },
    });
    if (!studentProgress) {
      res.status(404).json({ error: "Progressie niet gevonden." });
      return;
    }
    const updatedProgress = await prisma.learningObjectProgress.update({
      where: { id: studentProgress.progress.id },
      data: { done },
    });
    res.status(200).json({ message: "Progressie bijgewerkt.", progress: updatedProgress });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Er is iets misgegaan bij het updaten van progressie." });
  }
};

/**
 * GET /progress/student/:teamid
 * Haal als student de progressie op van jouw team.
 * (Controleer eerst of je lid bent van dat team.)
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
    // Controleer of de leerling in het team zit
    const student = await prisma.student.findUnique({
      where: { userId: req.user.id },
      include: { teams: true },
    });
    if (!student || !student.teams.some(team => team.id === teamId)) {
      res.status(403).json({ error: "Je maakt geen deel uit van dit team." });
      return;
    }
    // Haal het team op en verzamel de progressie van alle teamleden
    const team = await prisma.team.findUnique({
      where: { id: teamId },
      include: { students: true },
    });
    if (!team) {
      res.status(404).json({ error: "Team niet gevonden." });
      return;
    }
    const memberIds = team.students.map(s => s.userId);
    const progressRecords = await prisma.studentProgress.findMany({
      where: { studentId: { in: memberIds } },
      include: { progress: true },
    });
    if (progressRecords.length === 0) {
      res.status(404).json({ error: "Geen progressie gevonden voor dit team." });
      return;
    }
    // Bepaal de “verste” progressie (waarbij we uitgaan van een hoger progress id als indicator)
    const furthest = progressRecords.reduce((prev, curr) =>
      curr.progress.id > prev.progress.id ? curr : prev
    );
    res.status(200).json({ teamProgress: furthest.progress });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Er is iets misgegaan bij het ophalen van team progressie." });
  }
};

/**
 * GET /progress/student/assignment/:assignmentId
 * Haal als student jouw progressie op voor een assignment.
 * (Controleer eerst of je in een klas zit met deze assignment.)
 */
export const getStudentAssignmentProgress = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Niet ingelogd." });
      return;
    }
    const assignmentId = parseInt(req.params.assignmentId, 10);
    if (isNaN(assignmentId)) {
      res.status(400).json({ error: "Ongeldig assignment ID." });
      return;
    }
    // Controleer of de leerling in een klas zit met deze assignment
    const classes = await prisma.class.findMany({
      where: {
        joinRequests: { some: { studentId: req.user.id } },
        assignments: { some: { assignmentId } },
      },
    });
    if (classes.length === 0) {
      res.status(403).json({ error: "Je bent niet ingeschreven in een klas met deze assignment." });
      return;
    }
    // Haal de assignment op om de leerweg te bepalen
    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
    });
    if (!assignment) {
      res.status(404).json({ error: "Assignment niet gevonden." });
      return;
    }
    // Haal de leerobjecten op die deel uitmaken van de leerweg
    const nodes = await prisma.learningPathNode.findMany({
      where: { learningPathId: assignment.learningPathId },
      select: { nodeId: true },
    });
    const learningObjectIds = nodes.map(n => n.nodeId.toString());

    // Haal de progressie op van de leerling voor deze leerobjecten
    const progressRecords = await prisma.studentProgress.findMany({
      where: {
        studentId: req.user.id,
        progress: { learningObjectId: { in: learningObjectIds } },
      },
      include: { progress: true },
    });
    if (progressRecords.length === 0) {
      res.status(404).json({ error: "Geen progressie gevonden voor deze assignment." });
      return;
    }
    const furthest = progressRecords.reduce((prev, curr) =>
      curr.progress.id > prev.progress.id ? curr : prev
    );
    res.status(200).json({ assignmentProgress: furthest });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Er is iets misgegaan bij het ophalen van jouw assignment progressie." });
  }
};

/**
 * GET /progress/teacher/:teamid
 * Haal als docent de progressie op van een team.
 */
export const getTeamProgressTeacher = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const teamId = parseInt(req.params.teamid, 10);
    if (isNaN(teamId)) {
      res.status(400).json({ error: "Ongeldig team ID." });
      return;
    }
    const team = await prisma.team.findUnique({
      where: { id: teamId },
      include: { students: true },
    });
    if (!team) {
      res.status(404).json({ error: "Team niet gevonden." });
      return;
    }
    const memberIds = team.students.map(s => s.userId);
    const progressRecords = await prisma.studentProgress.findMany({
      where: { studentId: { in: memberIds } },
      include: { progress: true },
    });
    if (progressRecords.length === 0) {
      res.status(404).json({ error: "Geen progressie gevonden voor dit team." });
      return;
    }
    const furthest = progressRecords.reduce((prev, curr) =>
      curr.progress.id > prev.progress.id ? curr : prev
    );
    res.status(200).json({ teamProgress: furthest.progress });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Er is iets misgegaan bij het ophalen van team progressie." });
  }
};

/**
 * GET /progress/teacher/:assignmentId/average
 * Bereken als docent de gemiddelde vooruitgang van de klas bij een assignment.
 * De teamprogressie is gedefinieerd als het verste leerobject dat een teamlid heeft bereikt.
 */
export const getAssignmentAverageProgress = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const assignmentId = parseInt(req.params.assignmentId, 10);
    if (isNaN(assignmentId)) {
      res.status(400).json({ error: "Ongeldig assignment ID." });
      return;
    }
    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
    });
    if (!assignment) {
      res.status(404).json({ error: "Assignment niet gevonden." });
      return;
    }
    // Haal de leerobjecten op van de leerweg
    const nodes = await prisma.learningPathNode.findMany({
      where: { learningPathId: assignment.learningPathId },
      select: { nodeId: true },
    });
    const learningObjectIds = nodes.map(n => n.nodeId.toString());
    // Haal alle progressie-records op voor deze leerobjecten
    const progressRecords = await prisma.learningObjectProgress.findMany({
      where: { learningObjectId: { in: learningObjectIds } },
      include: { studentProgress: true },
    });
    if (progressRecords.length === 0) {
      res.status(404).json({ error: "Geen progressie gevonden voor deze assignment." });
      return;
    }
    // Voor elk student verzamelen we de verste progressie (aangenomen dat een hoger progress id verder is)
    const studentMax: { [key: number]: number } = {};
    for (const record of progressRecords) {
      for (const sp of record.studentProgress) {
        const sid = sp.studentId;
        if (!studentMax[sid] || record.id > studentMax[sid]) {
          studentMax[sid] = record.id;
        }
      }
    }
    const values = Object.values(studentMax);
    const average = values.reduce((sum, val) => sum + val, 0) / values.length;
    res.status(200).json({ average });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Er is iets misgegaan bij het berekenen van de gemiddelde progressie." });
  }
};
