import { PrismaClient, LearningObjectProgress } from "@prisma/client";

const prisma = new PrismaClient();

class ProgressService {
  /**
   * Maak een nieuw progress-record + studentProgress entry aan (transactie).
   * @param studentId id van de student
   * @param learningObjectId id van het lokale leerobject
   */
  async createProgress(studentId: number, learningObjectId: string): Promise<LearningObjectProgress> {
    const result = await prisma.$transaction(async (transactionPrisma) => {
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

    return result;
  }

  /**
   * Haal het LearningObjectProgress-record (en het bijhorende done‐veld) op
   * voor de gegeven student en leerobject.
   * Geeft `null` als er niets gevonden wordt.
   */
  async getStudentProgress(studentId: number, learningObjectId: string) {
    return prisma.studentProgress.findFirst({
      where: {
        studentId,
        progress: { learningObjectId },
      },
      include: { progress: true },
    });
  }

  /**
   * Markeer progress als 'done = true' voor de student + leerobject
   * Geeft het geüpdatete LearningObjectProgress-object terug.
   */
  async updateProgressToDone(progressId: number) {
    return prisma.learningObjectProgress.update({
      where: { id: progressId },
      data: { done: true },
    });
  }

  /**
   * Haal (team + assignment + students) op, op basis van teamId.
   */
  async getTeamWithAssignment(teamId: number) {
    return prisma.team.findUnique({
      where: { id: teamId },
      include: {
        students: true,
        teamAssignment: true,
      },
    });
  }

  /**
   * Haal de assignment op basis van ID.
   */
  async getAssignment(assignmentId: number) {
    return prisma.assignment.findUnique({
      where: { id: assignmentId },
    });
  }

  /**
   * Tel hoeveel LearningPathNodes er zijn voor een leerpad.
   */
  async countNodesInPath(learningPathId: string): Promise<number> {
    return prisma.learningPathNode.count({
      where: { learningPathId },
    });
  }

  /**
   * Haal de localLearningObjectId's op van alle niet-externe nodes in het leerpad.
   */
  async getLocalObjectIdsInPath(learningPathId: string): Promise<string[]> {
    const nodes = await prisma.learningPathNode.findMany({
      where: { learningPathId, isExternal: false },
      select: { localLearningObjectId: true },
    });
    return nodes
      .filter(n => n.localLearningObjectId !== null)
      .map(n => n.localLearningObjectId!);
  }

  /**
   * Telt het aantal studentProgress-records waarin 'done=true' en learningObjectId in de lijst zit.
   */
  async countDoneProgressForStudent(studentId: number, objectIds: string[]): Promise<number> {
    return prisma.studentProgress.count({
      where: {
        studentId,
        progress: { done: true, learningObjectId: { in: objectIds } },
      },
    });
  }

  /**
   * Haal alle teamAssignments voor een bepaalde assignment op,
   * inclusief de team + students per team.
   */
  async getTeamsForAssignment(assignmentId: number) {
    return prisma.teamAssignment.findMany({
      where: { assignmentId },
      include: { team: { include: { students: true } } },
    });
  }
}

export default new ProgressService();
