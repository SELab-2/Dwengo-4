import { Response } from "express";
import { Assignment, LearningObjectProgress, PrismaClient } from "@prisma/client";
import { AuthenticatedRequest } from "../interfaces/extendedTypeInterfaces";
import { getUserFromAuthRequest } from "../helpers/getUserFromAuthRequest";

const prisma = new PrismaClient();

/**
 * Creëert een nieuw progressie-record voor een student bij een (lokaal) leerobject.
 * Dit gebeurt wanneer een student een leerobject start (alleen lokaal).
 */
export const createProgress = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const studentId: number = getUserFromAuthRequest(req).id;
    const learningObjectId: string = req.params.learningObjectId; // ID van het LOCAL learningObject

    // Atomaire transactie
    const result = await prisma.$transaction(async (transactionPrisma) => {
      // Maak een nieuw progressie-record (aanvankelijk niet voltooid)
      const progress: LearningObjectProgress =
        await transactionPrisma.learningObjectProgress.create({
          data: {
            learningObjectId,
            done: false,
          },
        });

      // Koppel de progressie aan de ingelogde student
      await transactionPrisma.studentProgress.create({
        data: {
          studentId: studentId,
          progressId: progress.id,
        },
      });

      return { progress };
    });

    res.status(201).json({ message: "Progressie aangemaakt.", progress: result.progress });
    return;
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "Er is iets misgegaan bij het aanmaken van progressie." });
  }
};

/**
 * Haalt het progressie-record (done/ niet-done) van een student voor een specifiek lokaal leerobject.
 */
export const getStudentProgress = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const studentId: number = getUserFromAuthRequest(req).id;
    const { learningObjectId } = req.params; // local ID

    const studentProgress = await prisma.studentProgress.findFirst({
      where: {
        studentId: studentId,
        progress: { learningObjectId },
      },
      include: { progress: true },
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
 * Update het progressie-record van een student voor een *lokaal* leerobject (bv. done = true).
 */
export const updateProgress = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const studentId: number = getUserFromAuthRequest(req).id;
    const { learningObjectId } = req.params; // local ID

    // Zoek de StudentProgress
    const studentProgress = await prisma.studentProgress.findFirst({
      where: {
        studentId: studentId,
        progress: { learningObjectId },
      },
      include: { progress: true },
    });

    if (!studentProgress) {
      res.status(404).json({ error: "Progressie niet gevonden." });
      return;
    }

    // Markeer als done
    const updatedProgress = await prisma.learningObjectProgress.update({
      where: { id: studentProgress.progress.id },
      data: { done: true },
    });

    res
      .status(200)
      .json({ message: "Progressie bijgewerkt.", progress: updatedProgress });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Fout bij bijwerken van progressie." });
  }
};

/**
 * (Voor STUDENT) Bepaal de team-voortgang. 
 */
export const getTeamProgressStudent = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
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

    // Haal team + assignment
    const team = await prisma.team.findUnique({
      where: { id: teamId },
      include: {
        students: true,
        teamAssignment: true, // => assignmentId
      },
    });
    if (!team) {
      res.status(404).json({ error: "Team niet gevonden." });
      return;
    }
    const ta = team.teamAssignment;
    if (!ta) {
      res.status(404).json({ error: "Geen assignment gekoppeld aan dit team." });
      return;
    }

    // Haal assignment
    const assignment = await prisma.assignment.findUnique({
      where: { id: ta.assignmentId },
    });
    if (!assignment) {
      res.status(404).json({ error: "Opdracht niet gevonden." });
      return;
    }

    // Bepaal of assignment isExternal of niet
    if (assignment.isExternal) {
      // -> geen local path, geen nodes => 0% of skip
      res.json({ teamProgress: 0 });
      return;
    }
    // Als 'isExternal = false', dan is assignment.pathRef de local learningPath ID
    const localPathId = assignment.pathRef;

    // Tel nodes in dat local learning path
    const totalNodes: number = await prisma.learningPathNode.count({
      where: { learningPathId: localPathId },
    });
    if (totalNodes === 0) {
      res.status(404).json({ error: "Geen leerpadnodes gevonden." });
      return;
    }

    // Haal alle *lokaal* object-IDs uit de nodes
    // (we gaan ervan uit dat isExternal = false => localLearningObjectId != null)
    const nodes = await prisma.learningPathNode.findMany({
      where: { learningPathId: localPathId, isExternal: false },
      select: { localLearningObjectId: true },
    });
    const objectIds = nodes
      .filter((n) => n.localLearningObjectId !== null)
      .map((n) => n.localLearningObjectId!) ;

    let maxPercentage = 0;

    // Voor elke student
    for (const s of team.students) {
      const doneCount = await prisma.studentProgress.count({
        where: {
          studentId: s.userId,
          progress: {
            done: true,
            learningObjectId: { in: objectIds },
          },
        },
      });
      const percentage = (doneCount / totalNodes) * 100;
      if (percentage > maxPercentage) maxPercentage = percentage;
    }

    res.status(200).json({ teamProgress: maxPercentage });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Fout bij ophalen van team progressie (studentversie)." });
  }
};

/**
 * (Voor STUDENT) Hoe ver staat de student met deze assignment?
 */
export const getStudentAssignmentProgress = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const studentId: number = getUserFromAuthRequest(req).id;
    const assignmentId: number = parseInt(req.params.assignmentId, 10);
    if (isNaN(assignmentId)) {
      res.status(400).json({ error: "Ongeldig assignment ID." });
      return;
    }

    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
    });
    if (!assignment) {
      res.status(404).json({ error: "Opdracht niet gevonden." });
      return;
    }

    // Als isExternal -> Dwengo => 0%
    if (assignment.isExternal) {
      res.json({ assignmentProgress: 0 });
      return;
    }
    const localPathId = assignment.pathRef;

    // Tel nodes
    const totalNodes = await prisma.learningPathNode.count({
      where: { learningPathId: localPathId },
    });
    if (totalNodes === 0) {
      res.status(404).json({ error: "Geen leerpad nodes gevonden." });
      return;
    }

    // Haal local objects
    const nodes = await prisma.learningPathNode.findMany({
      where: { learningPathId: localPathId, isExternal: false },
      select: { localLearningObjectId: true },
    });
    const objectIds = nodes
      .filter((n) => n.localLearningObjectId)
      .map((n) => n.localLearningObjectId!) ;

    // Hoeveel done?
    const doneCount = await prisma.studentProgress.count({
      where: {
        studentId,
        progress: { done: true, learningObjectId: { in: objectIds } },
      },
    });

    const percentage = (doneCount / totalNodes) * 100;
    res.status(200).json({ assignmentProgress: percentage });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Fout bij ophalen van opdracht-voortgang (student)." });
  }
};

/**
 * Student: hoe ver staat hij/zij met *een volledig (lokaal) leerpad* 
 * (niet per se via assignment).
 */
export const getStudentLearningPathProgress = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const studentId: number = getUserFromAuthRequest(req).id;
    const { learningPathId } = req.params;
    if (!learningPathId) {
      res.status(400).json({ error: "Ongeldig leerpad ID." });
      return;
    }

    // Tel local nodes
    const totalNodes: number = await prisma.learningPathNode.count({
      where: { learningPathId, isExternal: false },
    });
    if (totalNodes === 0) {
      res
        .status(404)
        .json({ error: "Geen (lokale) nodes gevonden voor dit leerpad." });
      return;
    }

    // local object IDs
    const nodes = await prisma.learningPathNode.findMany({
      where: { learningPathId, isExternal: false },
      select: { localLearningObjectId: true },
    });
    const objectIds = nodes
      .filter((n) => n.localLearningObjectId)
      .map((n) => n.localLearningObjectId!) ;

    // Hoeveel done?
    const doneCount = await prisma.studentProgress.count({
      where: {
        studentId,
        progress: {
          done: true,
          learningObjectId: { in: objectIds },
        },
      },
    });

    const percentage = (doneCount / totalNodes) * 100;
    res.status(200).json({ learningPathProgress: percentage });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "Fout bij ophalen van leerpadvoortgang (student)." });
  }
};

/**
 * (Voor TEACHER) De teamvoortgang. 
 */
export const getTeamProgressTeacher = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
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

    const team = await prisma.team.findUnique({
      where: { id: teamId },
      include: {
        students: true,
        teamAssignment: true,
      },
    });
    if (!team) {
      res.status(404).json({ error: "Team niet gevonden." });
      return;
    }
    if (!team.teamAssignment) {
      res.status(404).json({ error: "Geen assignment gekoppeld aan dit team." });
      return;
    }

    const assignment = await prisma.assignment.findUnique({
      where: { id: team.teamAssignment.assignmentId },
    });
    if (!assignment) {
      res.status(404).json({ error: "Opdracht niet gevonden." });
      return;
    }
    // als extern => 0
    if (assignment.isExternal) {
      res.json({ teamProgress: 0 });
      return;
    }
    const localPathId = assignment.pathRef;

    // tel nodes
    const totalNodes = await prisma.learningPathNode.count({
      where: { learningPathId: localPathId, isExternal: false },
    });
    if (totalNodes === 0) {
      res
        .status(404)
        .json({ error: "Geen (lokale) nodes gevonden in dit leerpad." });
      return;
    }

    // local objects
    const nodes = await prisma.learningPathNode.findMany({
      where: { learningPathId: localPathId, isExternal: false },
      select: { localLearningObjectId: true },
    });
    const objectIds = nodes
      .filter((n) => n.localLearningObjectId)
      .map((n) => n.localLearningObjectId!) ;

    let maxPercentage = 0;
    for (const student of team.students) {
      const doneCount = await prisma.studentProgress.count({
        where: {
          studentId: student.userId,
          progress: { done: true, learningObjectId: { in: objectIds } },
        },
      });
      const perc = (doneCount / totalNodes) * 100;
      if (perc > maxPercentage) {
        maxPercentage = perc;
      }
    }
    res.status(200).json({ teamProgress: maxPercentage });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "Fout bij ophalen van teamprogressie (teacherversie)." });
  }
};

/**
 * (Voor TEACHER) Gemiddelde voortgang van een klas. 
 */
export const getAssignmentAverageProgress = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
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

    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
    });
    if (!assignment) {
      res.status(404).json({ error: "Opdracht niet gevonden." });
      return;
    }
    if (assignment.isExternal) {
      res.json({ averageProgress: 0 });
      return;
    }
    const localPathId = assignment.pathRef;

    // tel local nodes
    const totalNodes = await prisma.learningPathNode.count({
      where: { learningPathId: localPathId, isExternal: false },
    });
    if (totalNodes === 0) {
      res
        .status(404)
        .json({ error: "Geen lokale nodes gevonden voor dit leerpad." });
      return;
    }

    // local objects
    const nodes = await prisma.learningPathNode.findMany({
      where: { learningPathId: localPathId, isExternal: false },
      select: { localLearningObjectId: true },
    });
    const objectIds = nodes
      .filter((n) => n.localLearningObjectId)
      .map((n) => n.localLearningObjectId!) ;

    // alle teams
    const teamAssignments = await prisma.teamAssignment.findMany({
      where: { assignmentId },
      include: { team: { include: { students: true } } },
    });
    if (teamAssignments.length === 0) {
      res
        .status(404)
        .json({ error: "Geen teams gevonden voor deze opdracht." });
      return;
    }

    let totalProgress = 0;
    let teamCount = 0;

    for (const ta of teamAssignments) {
      const team = ta.team;
      let teamMax = 0;
      for (const student of team.students) {
        const doneCount = await prisma.studentProgress.count({
          where: {
            studentId: student.userId,
            progress: { done: true, learningObjectId: { in: objectIds } },
          },
        });
        const percentage = (doneCount / totalNodes) * 100;
        if (percentage > teamMax) {
          teamMax = percentage;
        }
      }
      totalProgress += teamMax;
      teamCount++;
    }

    const averageProgress = teamCount > 0 ? totalProgress / teamCount : 0;
    res.status(200).json({ averageProgress });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "Fout bij berekenen van gemiddelde voortgang." });
  }
};


