import { PrismaClient, LearningPath } from "@prisma/client";

const prisma = new PrismaClient();

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
    data: Required<LocalLearningPathData>
  ): Promise<LearningPath> {
    const newPath = await prisma.learningPath.create({
      data: {
        title: data.title,
        language: data.language,
        description: data.description || "",
        image: data.image,
        num_nodes: 0,
        num_nodes_left: 0,
        creatorId: teacherId,
        // unieker hruid
        hruid: `lp-${Date.now()}-${Math.floor(Math.random() * 100000)}`,
      },
    });
    return newPath;
  }

  async getAllLearningPathsByTeacher(teacherId: number): Promise<LearningPath[]> {
    return prisma.learningPath.findMany({
      where: { creatorId: teacherId },
      orderBy: { createdAt: "desc" },
    });
  }

  async getLearningPathById(pathId: string): Promise<LearningPath | null> {
    return prisma.learningPath.findUnique({
      where: { id: pathId },
    });
  }

  async updateLearningPath(pathId: string, data: LocalLearningPathData): Promise<LearningPath> {
    const updated = await prisma.learningPath.update({
      where: { id: pathId },
      data: {
        title: data.title,
        language: data.language,
        description: data.description,
        image: data.image,
      },
    });
    return updated;
  }

  async deleteLearningPath(pathId: string): Promise<void> {
    await prisma.learningPath.delete({
      where: { id: pathId },
    });
  }

  /**
   * Hulpmethode om bij elke mutatie van nodes het aantal nodes te herberekenen
   */
  async updateNumNodes(pathId: string): Promise<void> {
    const count = await prisma.learningPathNode.count({
      where: { learningPathId: pathId },
    });
    await prisma.learningPath.update({
      where: { id: pathId },
      data: { num_nodes: count },
    });
  }
}

export default new LocalLearningPathService();
