import { Response } from "express";
import { AuthenticatedRequest } from "../interfaces/extendedTypeInterfaces";
import { getUserFromAuthRequest } from "../helpers/getUserFromAuthRequest";
import progressService, {
  TeamWithStudentAndAssignment,
} from "../services/progressService";
import asyncHandler from "express-async-handler";
import { Assignment, LearningObjectProgress } from "@prisma/client";

/**
 * Creëert een nieuw progressie-record voor een student bij een (lokaal) leerobject.
 * Dit gebeurt wanneer een student een leerobject start (alleen lokaal).
 */
export const createProgress = asyncHandler(
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const studentId: number = getUserFromAuthRequest(req).id;
    const { learningObjectId } = req.params;

    const progress: LearningObjectProgress =
      await progressService.createProgress(studentId, learningObjectId);

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
    // Used for validation, the return value isn't used
    getUserFromAuthRequest(req);

    const teamId: number = req.params.teamId as unknown as number;

    // Haal team + assignment
    const team: TeamWithStudentAndAssignment =
      await progressService.getTeamWithAssignment(teamId);

    const assignment: Assignment = await progressService.getAssignment(
      team.teamAssignment!.assignmentId,
    );

    // Bepaal of assignment isExternal
    if (assignment.isExternal) {
      res.json({ teamProgress: 0 });
      return;
    }

    const { totalNodes, objectIds } = await getNodesAndObjectIds(
      assignment.pathRef,
    );

    let maxPercentage: number = 0;
    for (const s of team.students) {
      const doneCount: number =
        await progressService.countDoneProgressForStudent(s.userId, objectIds);
      const percentage: number = (doneCount / totalNodes) * 100;
      if (percentage > maxPercentage) {
        maxPercentage = percentage;
      }
    }

    res.status(200).json({ teamProgress: maxPercentage });
  },
);

const getNodesAndObjectIds = async (
  pathRef: string,
): Promise<{ totalNodes: number; objectIds: string[] }> => {
  // tel alle nodes in a local learning path
  const totalNodes: number = await progressService.countNodesInPath(pathRef);

  // haal local object ids
  const objectIds: string[] =
    await progressService.getLocalObjectIdsInPath(pathRef);

  return { totalNodes, objectIds };
};

/**
 * (Voor STUDENT) Hoe ver staat de student met deze assignment?
 */
export const getStudentAssignmentProgress = asyncHandler(
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const studentId: number = getUserFromAuthRequest(req).id;
    const assignmentId: number = req.params.assignmentId as unknown as number;

    const assignment: Assignment =
      await progressService.getAssignment(assignmentId);

    if (assignment.isExternal) {
      res.json({ assignmentProgress: 0 });
      return;
    }

    const { totalNodes, objectIds } = await getNodesAndObjectIds(
      assignment.pathRef,
    );

    const doneCount: number = await progressService.countDoneProgressForStudent(
      studentId,
      objectIds,
    );

    const percentage: number = (doneCount / totalNodes) * 100;
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

    const { totalNodes, objectIds } =
      await getNodesAndObjectIds(learningPathId);

    const doneCount: number = await progressService.countDoneProgressForStudent(
      studentId,
      objectIds,
    );

    const percentage: number = (doneCount / totalNodes) * 100;
    res.status(200).json({ learningPathProgress: percentage });
  },
);

/**
 * (Voor TEACHER) De teamvoortgang.
 */
export const getTeamProgressTeacher = asyncHandler(
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    getUserFromAuthRequest(req);

    const teamId: number = req.params.teamId as unknown as number;

    const team: TeamWithStudentAndAssignment =
      await progressService.getTeamWithAssignment(teamId);
    const assignment = await progressService.getAssignment(
      team.teamAssignment!.assignmentId,
    );

    if (assignment.isExternal) {
      res.json({ teamProgress: 0 });
      return;
    }

    const { totalNodes, objectIds } = await getNodesAndObjectIds(
      assignment.pathRef,
    );

    const maxPercentage: number = await calcMaxProgressForStudents(
      team,
      totalNodes,
      objectIds,
    );

    res.status(200).json({ teamProgress: maxPercentage });
  },
);

const calcMaxProgressForStudents = async (
  team: any,
  totalNodes: number,
  objectIds: string[],
): Promise<number> => {
  let maxPercentage: number = 0;
  for (const student of team.students) {
    const doneCount: number = await progressService.countDoneProgressForStudent(
      student.userId,
      objectIds,
    );
    const perc: number = (doneCount / totalNodes) * 100;
    if (perc > maxPercentage) {
      maxPercentage = perc;
    }
  }
  return maxPercentage;
};

/**
 * (Voor TEACHER) Gemiddelde voortgang van een klas (alle teams).
 */
export const getAssignmentAverageProgress = asyncHandler(
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    getUserFromAuthRequest(req);
    const assignmentId = req.params.assignmentId as unknown as number;

    const assignment: Assignment =
      await progressService.getAssignment(assignmentId);

    if (assignment.isExternal) {
      res.json({ averageProgress: 0 });
      return;
    }

    const { totalNodes, objectIds } = await getNodesAndObjectIds(
      assignment.pathRef,
    );

    const teamAssignments =
      await progressService.getTeamsForAssignment(assignmentId);

    let totalProgress: number = 0;
    let teamCount: number = 0;

    for (const ta of teamAssignments) {
      const team = ta.team;
      const teamMax: number = await calcMaxProgressForStudents(
        team,
        totalNodes,
        objectIds,
      );
      totalProgress += teamMax;
      teamCount++;
    }

    const averageProgress: number =
      teamCount > 0 ? totalProgress / teamCount : 0;
    res.status(200).json({ averageProgress });
  },
);
