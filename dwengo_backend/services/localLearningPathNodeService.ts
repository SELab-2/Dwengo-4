import { LearningObject, LearningPathNode } from "@prisma/client";
import prisma from "../config/prisma";
import {
  fetchDwengoObjectByHruidLangVersion,
  LearningObjectDto,
  validateDwengoObject,
} from "./dwengoLearningObjectService";
import LocalLearningObjectService from "./localLearningObjectService";
import {
  handlePrismaQuery,
  handlePrismaTransaction,
  handleQueryWithExistenceCheck,
} from "../errors/errorFunctions";
import { AccessDeniedError, BadRequestError } from "../errors/errors";

/**
 * Data object om een node te maken/updaten.
 */
export interface NodeData {
  isExternal: boolean;
  // Voor lokaal:
  localLearningObjectId?: string;

  // Voor Dwengo:
  dwengoHruid?: string;
  dwengoLanguage?: string;
  dwengoVersion?: number;

  // Overige eigenschappen:
  start_node?: boolean;
}

class LocalLearningPathNodeService {
  /**
   * Helper: check of de teacher de eigenaar is van leerpad 'pathId'
   */
  private async checkTeacherOwnsPath(teacherId: number, pathId: string) {
    const path = await handleQueryWithExistenceCheck(
      () =>
        prisma.learningPath.findUnique({
          where: { id: pathId },
        }),
      "Learning path not found.",
    );

    if (path.creatorId !== teacherId) {
      throw new AccessDeniedError("Teacher is not the creator of this path.");
    }
  }

  /**
   * Haal alle nodes van dit leerpad op.
   * @param includeLearningObjects: gives the option to include the learning objects metadata
   */
  async getAllNodesForPath(
    teacherId: number,
    pathId: string,
    includeLearningObjects: boolean,
  ): Promise<
    (LearningPathNode & {
      learningObject: LearningObject | LearningObjectDto | null;
    })[]
  > {
    await this.checkTeacherOwnsPath(teacherId, pathId);
    const nodes: LearningPathNode[] = await handlePrismaQuery(() =>
      prisma.learningPathNode.findMany({
        where: { learningPathId: pathId },
        include: {
          transitions: true,
        },
        orderBy: { position: "asc" },
      }),
    );

    if (includeLearningObjects) {
      const nodesWithObjects = await Promise.all(
        nodes.map(async (node) => {
          let learningObject: LearningObject | LearningObjectDto | null = null;
          // dwengo learning object
          if (node.isExternal) {
            learningObject = await fetchDwengoObjectByHruidLangVersion(
              node.dwengoHruid!, // todo: prettier way of making sure these fields are not null
              node.dwengoLanguage!,
              node.dwengoVersion!,
              true,
            );
          } else {
            learningObject = await LocalLearningObjectService.getLearningObjectById(
              node.localLearningObjectId!,
            );
          }
          return { ...node, learningObject };
        }),
      );
      return nodesWithObjects;
    }
    return nodes.map((node) => ({ ...node, learningObject: null }));
  }

  /**
   * Creëer nieuwe node in path, atomaire transactie:
   *  1) Node maken
   *  2) Aantal nodes updaten
   */
  async createNodeForPath(
    teacherId: number,
    pathId: string,
    data: NodeData,
  ): Promise<LearningPathNode> {
    await this.checkTeacherOwnsPath(teacherId, pathId);

    // 1) Valideer => afhankelijk van isExternal
    if (data.isExternal) {
      this.checkHruidLanguageVersion(data);
      await validateDwengoObject(
        data.dwengoHruid!,
        data.dwengoLanguage!,
        data.dwengoVersion!,
      );
    } else {
      if (!data.localLearningObjectId) {
        throw new BadRequestError("Missing localLearningObjectId for local node.");
      }
      await LocalLearningObjectService.getLearningObjectById(
        data.localLearningObjectId,
      );
    }

    // 2) Transactie:
    return await handlePrismaTransaction(prisma, async (tx) => {
      const count = await tx.learningPathNode.count({
        where: { learningPathId: pathId },
      });

      // 2a) Node maken
      const newNode = await tx.learningPathNode.create({
        data: {
          learningPathId: pathId,
          isExternal: data.isExternal,
          localLearningObjectId: data.isExternal
            ? undefined
            : data.localLearningObjectId,
          dwengoHruid: data.isExternal ? data.dwengoHruid : undefined,
          dwengoLanguage: data.isExternal ? data.dwengoLanguage : undefined,
          dwengoVersion: data.isExternal ? data.dwengoVersion : undefined,
          start_node: data.start_node ?? false,
          position: count, // nieuwe node komt achteraan
        },
      });

      // 2b) Aantal nodes bijwerken
      await tx.learningPath.update({
        where: { id: pathId },
        data: { num_nodes: count },
      });

      return newNode;
    });
  }

  /**
   * Update existing node
   * (Geen transactie nodig, want we doen 1 DB-call en we
   *  updaten niet het aantal nodes.)
   */
  async updateNodeForPath(
    teacherId: number,
    pathId: string,
    nodeId: string,
    data: NodeData,
  ): Promise<LearningPathNode> {
    await this.checkTeacherOwnsPath(teacherId, pathId);

    const node = await handleQueryWithExistenceCheck(
      () =>
        prisma.learningPathNode.findUnique({
          where: { nodeId },
        }),
      "Node not found.",
    );

    if (node.learningPathId !== pathId) {
      throw new BadRequestError("Node is not a part of this learning path.");
    }

    // Bepaal de nieuwe velden (als de client niet alles meestuurt, fallback naar de bestaande)
    const newIsExternal = data.isExternal ?? node.isExternal;

    let newLocalLearningObjectId = node.localLearningObjectId;
    let newDwengoHruid = node.dwengoHruid;
    let newDwengoLanguage = node.dwengoLanguage;
    let newDwengoVersion = node.dwengoVersion;

    // check of men echt de toggle "extern/lokaal" heeft aangepast
    if (data.isExternal !== undefined) {
      // men heeft de "extern vs lokaal" toggle aangepast
      if (newIsExternal) {
        // van false => true
        this.checkHruidLanguageVersion(data);
        await validateDwengoObject(
          data.dwengoHruid!,
          data.dwengoLanguage!,
          data.dwengoVersion!,
        );

        // overschrijf
        newDwengoHruid = data.dwengoHruid!;
        newDwengoLanguage = data.dwengoLanguage!;
        newDwengoVersion = data.dwengoVersion!;

        // en wis local
        newLocalLearningObjectId = null;
      } else {
        // van true => false
        if (!data.localLearningObjectId) {
          throw new BadRequestError("Missing localLearningObjectId for local node.");
        }
        await LocalLearningObjectService.getLearningObjectById(
          data.localLearningObjectId,
        );

        newLocalLearningObjectId = data.localLearningObjectId;
        // wis dwengo
        newDwengoHruid = null;
        newDwengoLanguage = null;
        newDwengoVersion = null;
      }
    } else {
      // isExternal ongewijzigd, maar misschien men geeft een nieuwe LORef / DwengoRef mee
      if (newIsExternal) {
        // Dwengo
        const newHruid =
          data.dwengoHruid !== undefined ? data.dwengoHruid : newDwengoHruid;
        const newLang =
          data.dwengoLanguage !== undefined
            ? data.dwengoLanguage
            : newDwengoLanguage;
        const newVer =
          data.dwengoVersion !== undefined ? data.dwengoVersion : newDwengoVersion;

        if (
          data.dwengoHruid !== undefined ||
          data.dwengoLanguage !== undefined ||
          data.dwengoVersion !== undefined
        ) {
          // user gaf iets nieuws in Dwengo
          if (!newHruid || !newLang || !newVer) {
            throw new BadRequestError("Missing required Dwengo info.");
          }
          if (typeof newVer !== "number") {
            throw new BadRequestError("Version must be a number.");
          }

          await validateDwengoObject(newHruid, newLang, newVer);
        }

        newDwengoHruid = newHruid;
        newDwengoLanguage = newLang;
        newDwengoVersion = newVer;
      } else {
        // lokaal node
        if (data.localLearningObjectId !== undefined) {
          // user gaf nieuwe local ID
          await LocalLearningObjectService.getLearningObjectById(
            data.localLearningObjectId,
          );
          newLocalLearningObjectId = data.localLearningObjectId;
        }
      }
    }

    // Aantal nodes blijft hetzelfde → geen updateNumNodes nodig
    return handlePrismaQuery(() =>
      prisma.learningPathNode.update({
        where: { nodeId },
        data: {
          isExternal: newIsExternal,
          localLearningObjectId: newIsExternal
            ? null
            : (newLocalLearningObjectId ?? null),
          dwengoHruid: newIsExternal ? newDwengoHruid : null,
          dwengoLanguage: newIsExternal ? newDwengoLanguage : null,
          dwengoVersion: newIsExternal ? newDwengoVersion : null,
          start_node: data.start_node ?? node.start_node,
        },
      }),
    );
  }

  /**
   * Verwijder node.
   * Atomaire transactie (2 acties):
   *   1) Node verwijderen
   *   2) Aantal nodes herberekenen
   */
  async deleteNodeFromPath(
    teacherId: number,
    pathId: string,
    nodeId: string,
  ): Promise<void> {
    await this.checkTeacherOwnsPath(teacherId, pathId);

    const node = await handleQueryWithExistenceCheck(
      () =>
        prisma.learningPathNode.findUnique({
          where: { nodeId },
        }),
      "Node not found.",
    );

    if (node.learningPathId !== pathId) {
      throw new BadRequestError("Node is not a part of the learning path.");
    }

    await handlePrismaTransaction(prisma, async (tx) => {
      // 1) Node verwijderen
      await tx.learningPathNode.delete({
        where: { nodeId },
      });

      // 2) Aantal nodes herberekenen
      const count = await tx.learningPathNode.count({
        where: { learningPathId: pathId },
      });
      await tx.learningPath.update({
        where: { id: pathId },
        data: { num_nodes: count },
      });
    });
  }

  private checkHruidLanguageVersion(data: NodeData) {
    if (!data.dwengoHruid) {
      throw new BadRequestError("Missing required dwengoHruid.");
    }
    if (!data.dwengoLanguage) {
      throw new BadRequestError("Missing required dwengoLanguage.");
    }
    if (typeof data.dwengoVersion !== "number") {
      throw new BadRequestError("Version must be a number.");
    }
  }
}

export default new LocalLearningPathNodeService();
