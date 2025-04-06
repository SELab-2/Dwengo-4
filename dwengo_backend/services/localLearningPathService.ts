import { LearningPath } from "@prisma/client";

import prisma from "../config/prisma";
import { handlePrismaQuery } from "../errors/errorFunctions";
import { NotFoundError } from "../errors/errors";

export interface LocalLearningPathData {
  title?: string;
  language?: string;
  description?: string;
  image?: string | null;
}

class LocalLearningPathService {
  /**
   * Maak leerpad met num_nodes = 0.
   */
  async createLearningPath(
    teacherId: number,
    data: Required<LocalLearningPathData>,
  ): Promise<LearningPath> {
    return await handlePrismaQuery(() =>
      prisma.learningPath.create({
        data: {
          title: data.title,
          language: data.language,
          description: data.description || "",
          image: data.image,
          num_nodes: 0,
          num_nodes_left: 0,
          creatorId: teacherId,
          // unieke hruid
          hruid: `lp-${Date.now()}-${Math.floor(Math.random() * 100000)}`,
        },
      }),
    );
  }

  async getAllLearningPathsByTeacher(
    teacherId: number,
  ): Promise<LearningPath[]> {
    return handlePrismaQuery(() =>
      prisma.learningPath.findMany({
        where: { creatorId: teacherId },
        orderBy: { createdAt: "desc" },
      }),
    );
  }

  async getLearningPathById(pathId: string): Promise<LearningPath> {
    const path: LearningPath | null = await handlePrismaQuery(() =>
      prisma.learningPath.findUnique({
        where: { id: pathId },
      }),
    );
    if (!path) {
      throw new NotFoundError("Learning path not found.");
    }
    return path;
  }

  async updateLearningPath(
    pathId: string,
    data: LocalLearningPathData,
  ): Promise<LearningPath> {
    return await handlePrismaQuery(() =>
      prisma.learningPath.update({
        where: { id: pathId },
        data: {
          title: data.title,
          language: data.language,
          description: data.description,
          image: data.image,
        },
      }),
    );
  }

  async deleteLearningPath(pathId: string): Promise<void> {
    await handlePrismaQuery(() =>
      prisma.learningPath.delete({
        where: { id: pathId },
      }),
    );
  }

  /**
   * Hulpmethode om bij elke mutatie van nodes het aantal nodes te herberekenen
   */
  async updateNumNodes(pathId: string): Promise<void> {
    const count = await handlePrismaQuery(() =>
      prisma.learningPathNode.count({
        where: { learningPathId: pathId },
      }),
    );
    await handlePrismaQuery(() =>
      prisma.learningPath.update({
        where: { id: pathId },
        data: { num_nodes: count },
      }),
    );
  }
}

export default new LocalLearningPathService();
