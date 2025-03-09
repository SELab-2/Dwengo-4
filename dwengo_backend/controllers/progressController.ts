import { Response } from "express";
import { PrismaClient } from "@prisma/client";
import { AuthenticatedRequest } from "../interfaces/extendedTypeInterfaces";

const prisma = new PrismaClient();

/**
 * Helper: Orden de leerpadnodes volgens de keten.
 * Deze functie gaat ervan uit dat het leerpad lineair is (één start-node en per node één nextNode).
 */
function orderLearningPathNodes<T extends { 
  nodeId: string; 
  start_node: boolean; 
  learningObjectId: string; 
  transitions: { nextNodeId: string | null }[]; 
}>(nodes: T[]): T[] {
  const nodeMap = new Map<string, T>();
  nodes.forEach((node) => nodeMap.set(node.nodeId, node));

  // Vind de start-node
  let current = nodes.find((n) => n.start_node);
  const ordered: T[] = [];
  
  while (current) {
    ordered.push(current);
    // Ga ervan uit dat er één nextTransition is met een nextNodeId
    const nextTransition = current.transitions.find((t) => t.nextNodeId);
    if (nextTransition && nextTransition.nextNodeId) {
      current = nodeMap.get(nextTransition.nextNodeId) || null;
    } else {
      break;
    }
  }
  return ordered;
}

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
    const learningObjectId = req.params.learningObjectId;
    const progress = await prisma.learningObjectProgress.create({
      data: {
        learningObjectId,
        done: false,
      },
    });
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
      include: { progress: true },
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
 * GET /progress/student/assignment/:assignmentId
 * Haal als student jouw progressie op voor een assignment.
 * Hierbij bepalen we de verste node (volgens de leerpadvolgorde) waarvoor je een voltooid record hebt.
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
    // Controleer of de student in een klas zit met deze assignment
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
    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
    });
    if (!assignment) {
      res.status(404).json({ error: "Assignment niet gevonden." });
      return;
    }
    // Haal alle nodes op van de leerweg, inclusief transitions en start_node
    const nodesRaw = await prisma.learningPathNode.findMany({
      where: { learningPathId: assignment.learningPathId },
      include: { transitions: { select: { nextNodeId: true } } },
      select: { nodeId: true, learningObjectId: true, start_node: true, transitions: true },
    });
    if (nodesRaw.length === 0) {
      res.status(404).json({ error: "Geen nodes gevonden voor deze leerweg." });
      return;
    }
    const nodes = orderLearningPathNodes(nodesRaw);
    // Haal de progressie van de student op voor leerobjecten in deze nodes (alleen done: true)
    const progressRecords = await prisma.studentProgress.findMany({
      where: {
        studentId: req.user.id,
        progress: { 
          learningObjectId: { in: nodes.map(n => n.learningObjectId) },
          done: true,
        },
      },
      include: { progress: true },
    });
    let maxIndex = -1;
    for (const record of progressRecords) {
      const index = nodes.findIndex(n => n.learningObjectId === record.progress.learningObjectId);
      if (index > maxIndex) {
        maxIndex = index;
      }
    }
    const furthestNode = maxIndex >= 0 ? nodes[maxIndex] : null;
    res.status(200).json({
      furthestNode,
      progressIndex: maxIndex >= 0 ? maxIndex + 1 : 0,
      totalNodes: nodes.length,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Er is iets misgegaan bij het ophalen van jouw assignment progressie." });
  }
};

/**
 * GET /progress/student/:teamid?assignmentId=...
 * Haal als student de teamprogressie op voor een specifieke assignment.
 * Hierbij wordt gecontroleerd of je in dat team zit en wordt de verste node (volgens leerpadvolgorde) bepaald.
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
    // Controleer of de student in het team zit
    const student = await prisma.student.findUnique({
      where: { userId: req.user.id },
      include: { Team: true },
    });
    if (!student || !student.Team.some(team => team.id === teamId)) {
      res.status(403).json({ error: "Je maakt geen deel uit van dit team." });
      return;
    }
    // Assignment-ID als query-parameter
    const assignmentIdParam = req.query.assignmentId as string;
    if (!assignmentIdParam) {
      res.status(400).json({ error: "Assignment ID is verplicht als query-parameter." });
      return;
    }
    const assignmentId = parseInt(assignmentIdParam, 10);
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
    const nodesRaw = await prisma.learningPathNode.findMany({
      where: { learningPathId: assignment.learningPathId },
      include: { transitions: { select: { nextNodeId: true } } },
      select: { nodeId: true, learningObjectId: true, start_node: true, transitions: true },
    });
    if (nodesRaw.length === 0) {
      res.status(404).json({ error: "Geen nodes gevonden voor deze leerweg." });
      return;
    }
    const nodes = orderLearningPathNodes(nodesRaw);
    // Haal teamleden op
    const team = await prisma.team.findUnique({
      where: { id: teamId },
      include: { students: true },
    });
    if (!team) {
      res.status(404).json({ error: "Team niet gevonden." });
      return;
    }
    const memberIds = team.students.map(s => s.userId);
    let teamMaxIndex = -1;
    for (const sid of memberIds) {
      const progressRecords = await prisma.studentProgress.findMany({
        where: {
          studentId: sid,
          progress: {
            learningObjectId: { in: nodes.map(n => n.learningObjectId) },
            done: true,
          },
        },
        include: { progress: true },
      });
      let maxIndex = -1;
      for (const record of progressRecords) {
        const index = nodes.findIndex(n => n.learningObjectId === record.progress.learningObjectId);
        if (index > maxIndex) {
          maxIndex = index;
        }
      }
      if (maxIndex > teamMaxIndex) {
        teamMaxIndex = maxIndex;
      }
    }
    const furthest = teamMaxIndex >= 0 ? nodes[teamMaxIndex] : null;
    res.status(200).json({
      teamProgress: furthest,
      progressIndex: teamMaxIndex >= 0 ? teamMaxIndex + 1 : 0,
      totalNodes: nodes.length,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Er is iets misgegaan bij het ophalen van team progressie." });
  }
};

/**
 * GET /progress/teacher/:teamid?assignmentId=...
 * Haal als docent de progressie op van een team voor een specifieke assignment.
 */
export const getTeamProgressTeacher = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const teamId = parseInt(req.params.teamid, 10);
    if (isNaN(teamId)) {
      res.status(400).json({ error: "Ongeldig team ID." });
      return;
    }
    const assignmentIdParam = req.query.assignmentId as string;
    if (!assignmentIdParam) {
      res.status(400).json({ error: "Assignment ID is verplicht als query-parameter." });
      return;
    }
    const assignmentId = parseInt(assignmentIdParam, 10);
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
    const nodesRaw = await prisma.learningPathNode.findMany({
      where: { learningPathId: assignment.learningPathId },
      include: { transitions: { select: { nextNodeId: true } } },
      select: { nodeId: true, learningObjectId: true, start_node: true, transitions: true },
    });
    if (nodesRaw.length === 0) {
      res.status(404).json({ error: "Geen nodes gevonden voor deze leerweg." });
      return;
    }
    const nodes = orderLearningPathNodes(nodesRaw);
    // Haal teamleden op
    const team = await prisma.team.findUnique({
      where: { id: teamId },
      include: { students: true },
    });
    if (!team) {
      res.status(404).json({ error: "Team niet gevonden." });
      return;
    }
    const memberIds = team.students.map(s => s.userId);
    let teamMaxIndex = -1;
    for (const sid of memberIds) {
      const progressRecords = await prisma.studentProgress.findMany({
        where: {
          studentId: sid,
          progress: {
            learningObjectId: { in: nodes.map(n => n.learningObjectId) },
            done: true,
          },
        },
        include: { progress: true },
      });
      let maxIndex = -1;
      for (const record of progressRecords) {
        const index = nodes.findIndex(n => n.learningObjectId === record.progress.learningObjectId);
        if (index > maxIndex) {
          maxIndex = index;
        }
      }
      if (maxIndex > teamMaxIndex) {
        teamMaxIndex = maxIndex;
      }
    }
    const furthest = teamMaxIndex >= 0 ? nodes[teamMaxIndex] : null;
    res.status(200).json({
      teamProgress: furthest,
      progressIndex: teamMaxIndex >= 0 ? teamMaxIndex + 1 : 0,
      totalNodes: nodes.length,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Er is iets misgegaan bij het ophalen van team progressie." });
  }
};

/**
 * GET /progress/teacher/:assignmentId/average
 * Bereken als docent de gemiddelde vooruitgang van de klas bij een assignment.
 * De vooruitgang wordt bepaald als de verste (hoogste) node-index (volgens de leerpadvolgorde) die studenten hebben bereikt.
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
    const nodesRaw = await prisma.learningPathNode.findMany({
      where: { learningPathId: assignment.learningPathId },
      include: { transitions: { select: { nextNodeId: true } } },
      select: { nodeId: true, learningObjectId: true, start_node: true, transitions: true },
    });
    if (nodesRaw.length === 0) {
      res.status(404).json({ error: "Geen nodes gevonden voor deze leerweg." });
      return;
    }
    const nodes = orderLearningPathNodes(nodesRaw);
    // Haal alle progressie-records op voor deze leerobjecten
    const progressRecords = await prisma.learningObjectProgress.findMany({
      where: { learningObjectId: { in: nodes.map(n => n.learningObjectId) } },
      include: { studentProgress: true },
    });
    if (progressRecords.length === 0) {
      res.status(404).json({ error: "Geen progressie gevonden voor deze assignment." });
      return;
    }
    // Voor iedere student verzamelen we de verste node-index
    const studentMax: { [key: number]: number } = {};
    for (const record of progressRecords) {
      for (const sp of record.studentProgress) {
        const sid = sp.studentId;
        const index = nodes.findIndex(n => n.learningObjectId === record.learningObjectId);
        if (index > -1 && (studentMax[sid] === undefined || index > studentMax[sid])) {
          studentMax[sid] = index;
        }
      }
    }
    const values = Object.values(studentMax);
    const average = values.length > 0 ? values.reduce((sum, val) => sum + val, 0) / values.length : 0;
    res.status(200).json({ averageProgress: average, totalNodes: nodes.length });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Er is iets misgegaan bij het berekenen van de gemiddelde progressie." });
  }
};
