import { Response } from "express";
import { AuthenticatedRequest } from "../interfaces/extendedTypeInterfaces";
import { getUserFromAuthRequest } from "../helpers/getUserFromAuthRequest";
import progressService from "../services/progressService";

/**
 * Creëert een nieuw progressie-record voor een student bij een (lokaal) leerobject.
 * Dit gebeurt wanneer een student een leerobject start (alleen lokaal).
 */
export const createProgress = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const studentId: number = getUserFromAuthRequest(req).id;
    const learningObjectId: string = req.params.learningObjectId;

    const progress = await progressService.createProgress(studentId, learningObjectId);

    res.status(201).json({
      message: "Progressie aangemaakt.",
      progress: progress,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Er is iets misgegaan bij het aanmaken van progressie.",
    });
  }
};

/**
 * Haalt het progressie-record (done/ niet-done) van een student voor een specifiek lokaal leerobject.
 */
export const getStudentProgress = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const studentId: number = getUserFromAuthRequest(req).id;
    const { learningObjectId } = req.params;

    const studentProgress = await progressService.getStudentProgress(
      studentId,
      learningObjectId,
    );

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
  res: Response,
): Promise<void> => {
  try {
    const studentId: number = getUserFromAuthRequest(req).id;
    const { learningObjectId } = req.params;

    // Zoeken of er al een studentProgress is
    const studentProgress = await progressService.getStudentProgress(
      studentId,
      learningObjectId,
    );

    if (!studentProgress) {
      res.status(404).json({ error: "Progressie niet gevonden." });
      return;
    }

    // Markeer als done
    const updatedProgress = await progressService.updateProgressToDone(
      studentProgress.progress.id,
    );

    res.status(200).json({
      message: "Progressie bijgewerkt.",
      progress: updatedProgress,
    });
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
  res: Response,
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
    const team = await progressService.getTeamWithAssignment(teamId);
    if (!team) {
      res.status(404).json({ error: "Team niet gevonden." });
      return;
    }
    if (!team.teamAssignment) {
      res.status(404).json({ error: "Geen assignment gekoppeld aan dit team." });
      return;
    }

    const assignment = await progressService.getAssignment(team.teamAssignment.assignmentId);
    if (!assignment) {
      res.status(404).json({ error: "Opdracht niet gevonden." });
      return;
    }

    // Bepaal of assignment isExternal
    if (assignment.isExternal) {
      res.json({ teamProgress: 0 });
      return;
    }

    // tel alle nodes in local learning path
    const totalNodes = await progressService.countNodesInPath(assignment.pathRef);
    if (totalNodes === 0) {
      res.status(404).json({ error: "Geen leerpadnodes gevonden." });
      return;
    }

    // haal local object ids
    const objectIds = await progressService.getLocalObjectIdsInPath(assignment.pathRef);

    let maxPercentage = 0;
    for (const s of team.students) {
      const doneCount = await progressService.countDoneProgressForStudent(s.userId, objectIds);
      const percentage = (doneCount / totalNodes) * 100;
      if (percentage > maxPercentage) {
        maxPercentage = percentage;
      }
    }

    res.status(200).json({ teamProgress: maxPercentage });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Fout bij ophalen van team progressie (studentversie).",
    });
  }
};

/**
 * (Voor STUDENT) Hoe ver staat de student met deze assignment?
 */
export const getStudentAssignmentProgress = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const studentId: number = getUserFromAuthRequest(req).id;
    const assignmentId: number = parseInt(req.params.assignmentId, 10);
    if (isNaN(assignmentId)) {
      res.status(400).json({ error: "Ongeldig assignment ID." });
      return;
    }

    const assignment = await progressService.getAssignment(assignmentId);
    if (!assignment) {
      res.status(404).json({ error: "Opdracht niet gevonden." });
      return;
    }

    if (assignment.isExternal) {
      res.json({ assignmentProgress: 0 });
      return;
    }

    const totalNodes = await progressService.countNodesInPath(assignment.pathRef);
    if (totalNodes === 0) {
      res.status(404).json({ error: "Geen leerpad nodes gevonden." });
      return;
    }

    const objectIds = await progressService.getLocalObjectIdsInPath(assignment.pathRef);
    const doneCount = await progressService.countDoneProgressForStudent(studentId, objectIds);

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
  res: Response,
): Promise<void> => {
  try {
    const studentId: number = getUserFromAuthRequest(req).id;
    const { learningPathId } = req.params;
    if (!learningPathId) {
      res.status(400).json({ error: "Ongeldig leerpad ID." });
      return;
    }

    // tel local nodes
    const totalNodes = await progressService.countNodesInPath(learningPathId);
    if (totalNodes === 0) {
      res.status(404).json({ error: "Geen (lokale) nodes gevonden voor dit leerpad." });
      return;
    }

    const objectIds = await progressService.getLocalObjectIdsInPath(learningPathId);
    const doneCount = await progressService.countDoneProgressForStudent(studentId, objectIds);

    const percentage = (doneCount / totalNodes) * 100;
    res.status(200).json({ learningPathProgress: percentage });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Fout bij ophalen van leerpadvoortgang (student)." });
  }
};

/**
 * (Voor TEACHER) De teamvoortgang.
 */
export const getTeamProgressTeacher = async (
  req: AuthenticatedRequest,
  res: Response,
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

    const team = await progressService.getTeamWithAssignment(teamId);
    if (!team) {
      res.status(404).json({ error: "Team niet gevonden." });
      return;
    }
    if (!team.teamAssignment) {
      res.status(404).json({ error: "Geen assignment gekoppeld aan dit team." });
      return;
    }

    const assignment = await progressService.getAssignment(team.teamAssignment.assignmentId);
    if (!assignment) {
      res.status(404).json({ error: "Opdracht niet gevonden." });
      return;
    }

    if (assignment.isExternal) {
      res.json({ teamProgress: 0 });
      return;
    }

    const totalNodes = await progressService.countNodesInPath(assignment.pathRef);
    if (totalNodes === 0) {
      res.status(404).json({ error: "Geen (lokale) nodes gevonden in dit leerpad." });
      return;
    }

    const objectIds = await progressService.getLocalObjectIdsInPath(assignment.pathRef);

    let maxPercentage = 0;
    for (const student of team.students) {
      const doneCount = await progressService.countDoneProgressForStudent(student.userId, objectIds);
      const perc = (doneCount / totalNodes) * 100;
      if (perc > maxPercentage) {
        maxPercentage = perc;
      }
    }

    res.status(200).json({ teamProgress: maxPercentage });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Fout bij ophalen van teamprogressie (teacherversie).",
    });
  }
};

/**
 * (Voor TEACHER) Gemiddelde voortgang van een klas (alle teams).
 */
export const getAssignmentAverageProgress = async (
  req: AuthenticatedRequest,
  res: Response,
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

    const assignment = await progressService.getAssignment(assignmentId);
    if (!assignment) {
      res.status(404).json({ error: "Opdracht niet gevonden." });
      return;
    }
    if (assignment.isExternal) {
      res.json({ averageProgress: 0 });
      return;
    }

    const totalNodes = await progressService.countNodesInPath(assignment.pathRef);
    if (totalNodes === 0) {
      res.status(404).json({ error: "Geen lokale nodes gevonden voor dit leerpad." });
      return;
    }

    const objectIds = await progressService.getLocalObjectIdsInPath(assignment.pathRef);
    const teamAssignments = await progressService.getTeamsForAssignment(assignmentId);

    if (teamAssignments.length === 0) {
      res.status(404).json({ error: "Geen teams gevonden voor deze opdracht." });
      return;
    }

    let totalProgress = 0;
    let teamCount = 0;

    for (const ta of teamAssignments) {
      const team = ta.team;
      let teamMax = 0;
      for (const student of team.students) {
        const doneCount = await progressService.countDoneProgressForStudent(student.userId, objectIds);
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
    res.status(500).json({
      error: "Fout bij berekenen van gemiddelde voortgang.",
    });
  }
};
