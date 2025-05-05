import { LearningObject, LearningPathNode } from "@prisma/client";
import { dwengoAPI } from "../config/dwengoAPI";
import prisma from "../config/prisma";
import {
  fetchDwengoObjectByHruidLangVersion,
  LearningObjectDto,
} from "./dwengoLearningObjectService";
import LocalLearningObjectService from "./localLearningObjectService";
import {
  handlePrismaQuery,
  handlePrismaTransaction,
  handleQueryWithExistenceCheck,
  throwCorrectNetworkError,
} from "../errors/errorFunctions";
import { AccessDeniedError, BadRequestError, NotFoundError } from "../errors/errors";
import { NodeMetadata } from "../controllers/teacher/teacherLocalLearningPathNodesController";

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
        await this.validateDwengoObject(
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
        await this.validateLocalObject(data.localLearningObjectId);

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

          await this.validateDwengoObject(newHruid, newLang, newVer);
        }

        newDwengoHruid = newHruid;
        newDwengoLanguage = newLang;
        newDwengoVersion = newVer;
      } else {
        // lokaal node
        if (data.localLearningObjectId !== undefined) {
          // user gaf nieuwe local ID
          await this.validateLocalObject(data.localLearningObjectId);
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

  async updateAllNodesForPath(
    teacherId: number,
    pathId: string,
    nodes: NodeMetadata[],
  ): Promise<void> {
    await this.checkTeacherOwnsPath(teacherId, pathId);

    const existingNodeIds: string[] = await handlePrismaQuery(() =>
      prisma.learningPathNode
        .findMany({
          where: { learningPathId: pathId },
          select: { nodeId: true, position: true },
          orderBy: { position: "asc" },
        })
        .then((nodes) => nodes.map((node) => node.nodeId)),
    );

    // start transaction
    await handlePrismaTransaction(prisma, async (tx) => {
      // track updated/created node id's (in order!)
      const processedNodeIds: string[] = [];

      // update existing nodes / add new nodes
      for (let newPosition = 0; newPosition < nodes.length; newPosition++) {
        const nodeData = nodes[newPosition];

        if (nodeData.nodeId) {
          // if nodeId is provided, this is an existing node that we need to update
          // only needs an upadate if the position is different
          if (
            newPosition >= existingNodeIds.length ||
            existingNodeIds[newPosition] !== nodeData.nodeId
          ) {
            await tx.learningPathNode.update({
              where: { nodeId: nodeData.nodeId },
              data: {
                position: newPosition, // update position in the list
                start_node: newPosition === 0, // first node is always start node
              },
            });
          }

          processedNodeIds.push(nodeData.nodeId);
        } else {
          // if nodeId is not provided, this is a new node that we need to create

          // first validate that the learning object exists
          if (nodeData.isExternal) {
            await this.validateDwengoObject(
              nodeData.dwengoHruid!,
              nodeData.dwengoLanguage!,
              nodeData.dwengoVersion!,
            );
          } else {
            if (!nodeData.localLearningObjectId) {
              throw new BadRequestError(
                "Missing localLearningObjectId for local node.",
              );
            }
            await this.validateLocalObject(nodeData.localLearningObjectId);
          }

          // now create the new node
          const node = await tx.learningPathNode.create({
            data: {
              learningPathId: pathId,
              isExternal: nodeData.isExternal,
              localLearningObjectId: nodeData.isExternal
                ? null
                : (nodeData.localLearningObjectId ?? null),
              dwengoHruid: nodeData.isExternal ? nodeData.dwengoHruid : null,
              dwengoLanguage: nodeData.isExternal ? nodeData.dwengoLanguage : null,
              dwengoVersion: nodeData.isExternal ? nodeData.dwengoVersion : null,
              start_node: newPosition === 0,
              position: newPosition,
            },
          });

          processedNodeIds.push(node.nodeId);
        }
      }

      // update/create default transitions
      for (let i = 0; i < processedNodeIds.length - 1; i++) {
        const currentNodeId = processedNodeIds[i];
        const nextNodeId = processedNodeIds[i + 1];

        // find current node's original position if it existed
        const currentOriginalIndex: number = existingNodeIds.indexOf(currentNodeId);

        if (
          currentOriginalIndex >= 0 && // current node is a node that already existed
          currentOriginalIndex < existingNodeIds.length - 1 // and it isn't the last node (so there's already an existing default transition)
        ) {
          if (existingNodeIds[currentOriginalIndex + 1] === nextNodeId) {
            // relative position is the same and both nodes already existed, so don't update transition
            continue;
          } else {
            // update existing default transition
            // there should only be one default transition, but we have to use updateMany since i don't have the transitionId
            tx.learningPathTransition.updateMany({
              where: { nodeId: currentNodeId, default: true },
              data: { nextNodeId },
            });
          }
        } else {
          // create new default transition
          await tx.learningPathTransition.create({
            data: {
              nodeId: currentNodeId,
              nextNodeId,
              default: true,
            },
          });
        }
      }
      // delete default transition for last node (if it had one) (indicates end of path)
      const lastNodeId = processedNodeIds[processedNodeIds.length - 1];
      await tx.learningPathTransition.deleteMany({
        where: {
          nodeId: lastNodeId,
          default: true,
        },
      });

      // delete nodes that were not in list of nodes passed in the argument
      const nodesToDelete: string[] = existingNodeIds.filter(
        (id) => !processedNodeIds.includes(id),
      );
      // since prisma schema has ON DELETE CASCADE, the transistions involving these nodes will be deleted aswell
      if (nodesToDelete.length > 0) {
        await tx.learningPathNode.deleteMany({
          where: {
            nodeId: {
              in: nodesToDelete,
            },
          },
        });
      }

      // update the number of nodes in the learning path
      await tx.learningPath.update({
        where: { id: pathId },
        data: { num_nodes: processedNodeIds.length },
      });
    });
  }

  /**
   *  ================================
   *  1) Check of local LearningObject bestaat
   *  ================================
   */
  private async validateLocalObject(loId: string): Promise<void> {
    await handleQueryWithExistenceCheck(
      () =>
        prisma.learningObject.findUnique({
          where: { id: loId },
        }),
      `Local learning object not found.`,
    );
  }

  /**
   *  ================================
   *  2) Check of external Dwengo object bestaat
   *  ================================
   */
  private async validateDwengoObject(
    hruid: string,
    language: string,
    version: number,
  ): Promise<void> {
    try {
      const resp = await dwengoAPI.get(
        `/api/learningObject/getMetadata?hruid=${hruid}&language=${language}&version=${version}`,
      );
      if (!resp.data) {
        throw new NotFoundError(
          `Dwengo-object (hruid=${hruid}, lang=${language}, ver=${version}) not found.`,
        );
      }
    } catch (err: any) {
      throwCorrectNetworkError(
        err as Error,
        "Could not fetch the requested learning object from the Dwengo API.",
      );
    }
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
