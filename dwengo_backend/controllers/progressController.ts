import { Response } from "express";
import { AuthenticatedRequest } from "../interfaces/extendedTypeInterfaces";
import { getUserFromAuthRequest } from "../helpers/getUserFromAuthRequest";
import progressService from "../services/progressService";
import asyncHandler from "express-async-handler";
import { LearningObjectProgress } from "@prisma/client";

/**
 * Creëert een nieuw progressie-record voor een student bij een (lokaal) leerobject.
 * Dit gebeurt wanneer een student een leerobject start (alleen lokaal).
 */
export const createProgress = asyncHandler(
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const studentId: number = getUserFromAuthRequest(req).id;
    const learningObjectId: string = req.params.learningObjectId;

    const progress = await progressService.createProgress(
      studentId,
      learningObjectId,
    );

    res.status(201).json({
      message: "Progressie aangemaakt.",
      progress: progress,
    });
  },
);

/**
 * Haalt het progressie-record (done/ niet-done) van een student voor een specifiek lokaal leerobject.
 */
export const getStudentProgress = asyncHandler(
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const studentId: number = getUserFromAuthRequest(req).id;
    const { learningObjectId } = req.params;

    const studentProgress: LearningObjectProgress =
      await progressService.getStudentProgress(studentId, learningObjectId);
    res.status(200).json(studentProgress);
  },
);

/**
 * Update het progressie-record van een student voor een *lokaal* leerobject (bv. done = true).
 */
export const updateProgress = asyncHandler(
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const studentId: number = getUserFromAuthRequest(req).id;
    const { learningObjectId } = req.params;

    // Zoeken of er al een studentProgress is
    const studentProgress: LearningObjectProgress =
      await progressService.getStudentProgress(studentId, learningObjectId);

    // Markeer als done
    const updatedProgress = await progressService.updateProgressToDone(
      studentProgress.id,
    );

    res.status(200).json({
      message: "Progression successfully updated.",
      progress: updatedProgress,
    });
  },
);

/**
 * (Voor STUDENT) Bepaal de team-voortgang.
 */
export const getTeamProgressStudent = asyncHandler(
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
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

    const assignment = await progressService.getAssignment(
      team.teamAssignment!.assignmentId,
    );

    // Bepaal of assignment isExternal
    if (assignment.isExternal) {
      res.json({ teamProgress: 0 });
      return;
    }

    // tel alle nodes in local learning path
    const totalNodes = await progressService.countNodesInPath(
      assignment.pathRef,
    );

    // haal local object ids
    const objectIds = await progressService.getLocalObjectIdsInPath(
      assignment.pathRef,
    );

    let maxPercentage = 0;
    for (const s of team.students) {
      const doneCount = await progressService.countDoneProgressForStudent(
        s.userId,
        objectIds,
      );
      const percentage = (doneCount / totalNodes) * 100;
      if (percentage > maxPercentage) {
        maxPercentage = percentage;
      }
    }

    res.status(200).json({ teamProgress: maxPercentage });
  },
);

/**
 * (Voor STUDENT) Hoe ver staat de student met deze assignment?
 */
export const getStudentAssignmentProgress = asyncHandler(
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const studentId: number = getUserFromAuthRequest(req).id;
    const assignmentId: number = parseInt(req.params.assignmentId, 10);
    if (isNaN(assignmentId)) {
      res.status(400).json({ error: "Ongeldig assignment ID." });
      return;
    }

    const assignment = await progressService.getAssignment(assignmentId);

    if (assignment.isExternal) {
      res.json({ assignmentProgress: 0 });
      return;
    }

    const totalNodes = await progressService.countNodesInPath(
      assignment.pathRef,
    );

    const objectIds = await progressService.getLocalObjectIdsInPath(
      assignment.pathRef,
    );
    const doneCount = await progressService.countDoneProgressForStudent(
      studentId,
      objectIds,
    );

    const percentage = (doneCount / totalNodes) * 100;
    res.status(200).json({ assignmentProgress: percentage });
  },
);

/**
 * Student: hoe ver staat hij/zij met *een volledig (lokaal) leerpad*
 * (niet per se via assignment).
 */
export const getStudentLearningPathProgress = asyncHandler(
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const studentId: number = getUserFromAuthRequest(req).id;
    const { learningPathId } = req.params;
    if (!learningPathId) {
      res.status(400).json({ error: "Ongeldig leerpad ID." });
      return;
    }

    // tel local nodes
    const totalNodes = await progressService.countNodesInPath(learningPathId);

    const objectIds =
      await progressService.getLocalObjectIdsInPath(learningPathId);
    const doneCount = await progressService.countDoneProgressForStudent(
      studentId,
      objectIds,
    );

    const percentage = (doneCount / totalNodes) * 100;
    res.status(200).json({ learningPathProgress: percentage });
  },
);

/**
 * (Voor TEACHER) De teamvoortgang.
 */
export const getTeamProgressTeacher = asyncHandler(
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
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
    const assignment = await progressService.getAssignment(
      team.teamAssignment!.assignmentId,
    );

    if (assignment.isExternal) {
      res.json({ teamProgress: 0 });
      return;
    }

    const totalNodes = await progressService.countNodesInPath(
      assignment.pathRef,
    );

    const objectIds = await progressService.getLocalObjectIdsInPath(
      assignment.pathRef,
    );

    let maxPercentage = 0;
    for (const student of team.students) {
      const doneCount = await progressService.countDoneProgressForStudent(
        student.userId,
        objectIds,
      );
      const perc = (doneCount / totalNodes) * 100;
      if (perc > maxPercentage) {
        maxPercentage = perc;
      }
    }

    res.status(200).json({ teamProgress: maxPercentage });
  },
);

/**
 * (Voor TEACHER) Gemiddelde voortgang van een klas (alle teams).
 */
export const getAssignmentAverageProgress = asyncHandler(
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
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

    if (assignment.isExternal) {
      res.json({ averageProgress: 0 });
      return;
    }

    const totalNodes = await progressService.countNodesInPath(
      assignment.pathRef,
    );

    const objectIds = await progressService.getLocalObjectIdsInPath(
      assignment.pathRef,
    );
    const teamAssignments =
      await progressService.getTeamsForAssignment(assignmentId);

    let totalProgress = 0;
    let teamCount = 0;

    for (const ta of teamAssignments) {
      const team = ta.team;
      let teamMax = 0;
      for (const student of team.students) {
        const doneCount = await progressService.countDoneProgressForStudent(
          student.userId,
          objectIds,
        );
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
  },
);
