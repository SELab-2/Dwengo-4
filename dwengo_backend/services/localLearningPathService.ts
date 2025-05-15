import { LearningPath, LearningPath as PrismaLearningPath } from "@prisma/client";
import { LearningPathDto } from "./learningPathService"; // <-- We hergebruiken het type
import prisma from "../config/prisma";
import {
  handlePrismaQuery,
  handlePrismaTransaction,
  handleQueryWithExistenceCheck,
} from "../errors/errorFunctions";
import { BadRequestError, NotFoundError } from "../errors/errors";
import { NodeMetadata } from "../controllers/teacher/teacherLocalLearningPathNodesController";
import { validateDwengoObject } from "./dwengoLearningObjectService";
import LocalLearningObjectService from "./localLearningObjectService";

// this is the data we get from a request body
export interface LocalLearningPathData {
  title: string;
  language: string;
  description?: string;
  image?: string | null;
  // can contain existing (re-ordered) nodes and new nodes, nodes not present in the list will be deleted
  nodes?: NodeMetadata[];
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
    return await handlePrismaTransaction(prisma, async (tx) => {
      // create learning path with the provided title, description, image and language
      const createdPath: LearningPath = await tx.learningPath.create({
        data: {
          title: data.title,
          language: data.language,
          description: data.description || "",
          image: data.image ?? null,
          num_nodes: data.nodes?.length || 0,
          num_nodes_left: 0,
          creatorId: teacherId,
          // unieke hruid
          hruid: `lp-${Date.now()}-${Math.floor(Math.random() * 100000)}`,
        },
      });

      // create the nodes
      const createdNodeIds: string[] = [];
      for (let position = 0; position < data.nodes.length; position++) {
        const nodeData = data.nodes[position];

        // first validate that the learning object exists
        if (nodeData.isExternal) {
          await validateDwengoObject(
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
          await LocalLearningObjectService.getLearningObjectById(
            nodeData.localLearningObjectId,
          );
        }

        // now create the new node
        const node = await tx.learningPathNode.create({
          data: {
            learningPathId: createdPath.id, // use the hruid of the learning path we just created
            isExternal: nodeData.isExternal,
            localLearningObjectId: nodeData.isExternal
              ? null
              : (nodeData.localLearningObjectId ?? null),
            dwengoHruid: nodeData.isExternal ? nodeData.dwengoHruid : null,
            dwengoLanguage: nodeData.isExternal ? nodeData.dwengoLanguage : null,
            dwengoVersion: nodeData.isExternal ? nodeData.dwengoVersion : null,
            start_node: position === 0, // first node is always start node
            position,
          },
        });

        createdNodeIds.push(node.nodeId);
      }

      // create default transitions for the nodes
      for (let i = 0; i < createdNodeIds.length - 1; i++) {
        const currentNodeId = createdNodeIds[i];
        const nextNodeId = createdNodeIds[i + 1];

        await tx.learningPathTransition.create({
          data: {
            nodeId: currentNodeId,
            nextNodeId,
            default: true,
          },
        });
      }

      return createdPath;
    });
  }

  async getAllLearningPathsByTeacher(teacherId: number): Promise<LearningPath[]> {
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
    // get existing nodes, so we can figure out which nodes to delete, update or create
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
    return await handlePrismaTransaction(prisma, async (tx) => {
      // update learning path title, description and language
      await tx.learningPath.update({
        where: { id: pathId },
        data: {
          title: data.title,
          description: data.description,
          language: data.language,
          image: data.image,
        },
      });

      // track updated/created node id's (in order!)
      const processedNodeIds: string[] = [];

      // update existing nodes / add new nodes
      const nodes = data.nodes || [];
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
            await validateDwengoObject(
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
            await LocalLearningObjectService.getLearningObjectById(
              nodeData.localLearningObjectId,
            );
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
      return await tx.learningPath.update({
        where: { id: pathId },
        data: { num_nodes: processedNodeIds.length },
      });
    });
  }

  async deleteLearningPath(pathId: string): Promise<void> {
    await handlePrismaQuery(() =>
      prisma.learningPath.delete({
        where: { id: pathId },
      }),
    );
  }

  /*async updateNumNodes(pathId: string): Promise<void> {
    // Count the number of nodes within the transaction
    const count: number = await prisma.learningPathNode.count({
      where: { learningPathId: pathId },
    });

    // Update the learning path's num_nodes within the same transaction
    await prisma.learningPath.update({
      where: { id: pathId },
      data: { num_nodes: count },
    });
  }*/

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
   * [AANGEPAST] Haal 1 leerpad (in DTO) op via id of hruid,
   * met optionele voortgang voor de gegeven student.
   */
  async getLearningPathAsDtoByIdOrHruid(
    idOrHruid: string,
    includeProgress: boolean = false,
    studentId?: number,
  ): Promise<LearningPathDto> {
    // 1) Probeer op id
    const byId = await handlePrismaQuery(() =>
      prisma.learningPath.findUnique({ where: { id: idOrHruid } }),
    );

    // 2) Probeer op hruid als niet op id gevonden
    const lp =
      byId ??
      (await handlePrismaQuery(() =>
        prisma.learningPath.findUnique({ where: { hruid: idOrHruid } }),
      ));

    if (!lp) throw new NotFoundError("Learning path not found.");

    // Basis DTO zonder nodes
    const baseDto = mapLocalPathToDto(lp);

    // Als geen progressie nodig is of geen studentId, geef alleen basis terug
    if (!includeProgress || studentId === undefined) {
      return baseDto;
    }

    // Haal alle nodes van dit leerpad
    const nodes = await prisma.learningPathNode.findMany({
      where: { learningPathId: lp.id },
    });

    // Voor elke node: bepaal done-status
    const nodesWithProgress = await Promise.all(
      nodes.map(async (node) => {
        let done = false;
        const localObjId = node.localLearningObjectId;
        if (localObjId) {
          // Zoek studentProgress met relation filter op LearningObjectProgress
          const sp = await prisma.studentProgress.findFirst({
            where: {
              studentId,
              progress: {
                is: { learningObjectId: localObjId },
              },
            },
          });
          done = sp !== null;
        }
        return {
          nodeId: node.nodeId,
          isExternal: node.isExternal,
          localLearningObjectId: node.localLearningObjectId ?? undefined,
          dwengoHruid: node.dwengoHruid ?? undefined,
          done: done,
        };
      }),
    );

    return {
      ...baseDto,
      nodes: nodesWithProgress,
    };
  }
}

const localLearningPathService = new LocalLearningPathService();
export default localLearningPathService;
