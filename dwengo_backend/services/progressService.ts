import {
  LearningObjectProgress,
  Student,
  Team,
  TeamAssignment,
} from "@prisma/client";
import prisma from "../config/prisma";
import {
  handlePrismaQuery,
  handlePrismaTransaction,
  handleQueryWithExistenceCheck,
} from "../errors/errorFunctions";
import { NotFoundError } from "../errors/errors";

type TeamWithStudentAndAssignment = Team & {
  students: Student[];
  teamAssignment: TeamAssignment | null;
};

class ProgressService {
  /**
   * Maak een nieuw progress-record + studentProgress entry aan (transactie).
   * @param studentId id van de student
   * @param learningObjectId id van het lokale leerobject
   */
  async createProgress(
    studentId: number,
    learningObjectId: string,
  ): Promise<LearningObjectProgress> {
    return await handlePrismaTransaction(prisma, async (transactionPrisma) => {
      const progress = await transactionPrisma.learningObjectProgress.create({
        data: {
          learningObjectId,
          done: false,
        },
      });

      await transactionPrisma.studentProgress.create({
        data: {
          studentId,
          progressId: progress.id,
        },
      });

      return progress;
    });
  }

  /**
   * Haal het LearningObjectProgress-record (en het bijhorende done‐veld) op
   * voor de gegeven student en leerobject.
   */
  async getStudentProgress(
    studentId: number,
    learningObjectId: string,
  ): Promise<LearningObjectProgress> {
    const progress = await handleQueryWithExistenceCheck(
      () =>
        prisma.studentProgress.findFirst({
          where: {
            studentId,
            progress: { learningObjectId },
          },
          include: { progress: true },
        }),
      "Progress not found.",
    );
    return progress.progress;
  }

  /**
   * Markeer progress als 'done = true' voor de student + leerobject
   * Geeft het geüpdatete LearningObjectProgress-object terug.
   */
  async updateProgressToDone(progressId: number) {
    return handlePrismaQuery(() =>
      prisma.learningObjectProgress.update({
        where: { id: progressId },
        data: { done: true },
      }),
    );
  }

  /**
   * Haal (team + assignment + students) op, op basis van teamId.
   */
  async getTeamWithAssignment(
    teamId: number,
  ): Promise<TeamWithStudentAndAssignment> {
    return await handleQueryWithExistenceCheck(
      () =>
        prisma.team.findUnique({
          where: { id: teamId },
          include: {
            students: true,
            teamAssignment: true,
          },
        }),
      '"Team assignment not found.',
    );
  }

  /**
   * Haal de assignment op basis van ID.
   */
  async getAssignment(assignmentId: number) {
    return await handleQueryWithExistenceCheck(
      () =>
        prisma.assignment.findUnique({
          where: { id: assignmentId },
        }),
      "Assignment not found.",
    );
  }

  /**
   * Tel hoeveel LearningPathNodes er zijn voor een leerpad.
   */
  async countNodesInPath(learningPathId: string): Promise<number> {
    const count: number = await handlePrismaQuery(() =>
      prisma.learningPathNode.count({
        where: { learningPathId },
      }),
    );
    // Als count 0 is, dan bestaat het leerpad niet.
    // Een leerpad moet altijd meer dan 0 nodes hebben.
    if (count === 0) {
      throw new NotFoundError("Learning path not found.");
    }
    return count;
  }

  /**
   * Haal de localLearningObjectId's op van alle niet-externe nodes in het leerpad.
   */
  async getLocalObjectIdsInPath(learningPathId: string): Promise<string[]> {
    const nodes = await handlePrismaQuery(() =>
      prisma.learningPathNode.findMany({
        where: { learningPathId, isExternal: false },
        select: { localLearningObjectId: true },
      }),
    );
    return nodes
      .filter((n) => n.localLearningObjectId !== null)
      .map((n) => n.localLearningObjectId!);
  }

  /**
   * Telt het aantal studentProgress-records waarin 'done=true' en learningObjectId in de lijst zit.
   */
  async countDoneProgressForStudent(
    studentId: number,
    objectIds: string[],
  ): Promise<number> {
    return await handlePrismaQuery(() =>
      prisma.studentProgress.count({
        where: {
          studentId,
          progress: { done: true, learningObjectId: { in: objectIds } },
        },
      }),
    );
  }

  /**
   * Haal alle teamAssignments voor een bepaalde assignment op,
   * inclusief de team + students per team.
   */
  async getTeamsForAssignment(assignmentId: number) {
    return await handlePrismaQuery(() =>
      prisma.teamAssignment.findMany({
        where: { assignmentId },
        include: { team: { include: { students: true } } },
      }),
    );
  }
}

export default new ProgressService();
