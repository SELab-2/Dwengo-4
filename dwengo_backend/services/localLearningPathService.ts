import {
  LearningPath,
  LearningPath as PrismaLearningPath,
} from "@prisma/client";
import { LearningPathDto } from "./learningPathService"; // <-- We hergebruiken het type
import prisma from "../config/prisma";
import {
  handlePrismaQuery,
  handleQueryWithExistenceCheck,
} from "../errors/errorFunctions";
import { NotFoundError } from "../errors/errors";

export interface LocalLearningPathData {
  title?: string;
  language?: string;
  description?: string;
  image?: string | null;
}

/**
 * DB record => Dto (maar we matchen 'LearningPathDto')
 * Let op: we zetten isExternal = false
 */
function mapLocalPathToDto(lp: PrismaLearningPath): LearningPathDto {
  return {
    _id: lp.id,
    hruid: lp.hruid,
    language: lp.language,
    title: lp.title,
    description: lp.description,
    image: lp.image ?? "",
    num_nodes: lp.num_nodes ?? 0,
    num_nodes_left: lp.num_nodes_left ?? 0,
    nodes: [], // we laten 'nodes' leeg of je zou ze hier kunnen mappen
    createdAt: lp.createdAt.toISOString(),
    updatedAt: lp.updatedAt.toISOString(),
    // cruciaal!
    isExternal: false,
  };
}

export class LocalLearningPathService {
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
          image: data.image ?? null,
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
    return await handlePrismaQuery(() =>
      prisma.learningPath.findMany({
        where: { creatorId: teacherId },
        orderBy: { createdAt: "desc" },
        include: {
          creator: {
            include: {
              user: true,
            },
          },
        },
      }),
    );
  }

  async getLearningPathById(pathId: string): Promise<LearningPath> {
    return await handleQueryWithExistenceCheck(
      () =>
        prisma.learningPath.findUnique({
          where: { id: pathId },
        }),
      "Learning path not found.",
    );
  }

  async updateLearningPath(
    pathId: string,
    data: LocalLearningPathData,
  ): Promise<LearningPath> {
    return handlePrismaQuery(() =>
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

  /**
   * [NIEUW] Zoeken naar lokale leerpaden op basis van filters
   */
  async searchLocalPaths(filters: {
    language?: string;
    hruid?: string;
    title?: string;
    description?: string;
    all?: string;
  }): Promise<LearningPathDto[]> {
    const whereClause: any = {};

    // als all is gedefinieerd => geen filtering
    if (filters.all === undefined) {
      if (filters.language) {
        whereClause.language = {
          contains: filters.language,
          mode: "insensitive",
        };
      }
      if (filters.hruid) {
        whereClause.hruid = filters.hruid; // exacte match
      }
      if (filters.title) {
        whereClause.title = { contains: filters.title, mode: "insensitive" };
      }
      if (filters.description) {
        whereClause.description = {
          contains: filters.description,
          mode: "insensitive",
        };
      }
    }

    const results = await prisma.learningPath.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
    });
    // map => isExternal=false
    return results.map(mapLocalPathToDto);
  }

  /**
   * [NIEUW] Haal 1 leerpad (in Dto) op via id of hruid
   */
  async getLearningPathAsDtoByIdOrHruid(
    idOrHruid: string,
  ): Promise<LearningPathDto> {
    // 1) Probeer op id
    const byId = await handlePrismaQuery(() =>
      prisma.learningPath.findUnique({
        where: { id: idOrHruid },
      }),
    );
    if (byId) {
      return mapLocalPathToDto(byId);
    }
    // 2) Probeer op hruid
    const byHruid = await handlePrismaQuery(() =>
      prisma.learningPath.findUnique({
        where: { hruid: idOrHruid },
      }),
    );
    if (byHruid) {
      return mapLocalPathToDto(byHruid);
    }
    throw new NotFoundError("Learning path not found.");
  }
}

const localLearningPathService = new LocalLearningPathService();
export default localLearningPathService;
