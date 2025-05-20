import { LearningPath, LearningPath as PrismaLearningPath } from "@prisma/client";
import { LearningPathDto, LearningPathTransition } from "./learningPathService"; // <-- We hergebruiken het type

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
function mapLocalPathToDto(
  lp: PrismaLearningPath & {
    creator?: { userId: number; user: { firstName: string; lastName: string } };
  },
): LearningPathDto {
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
    creator: {
      id: lp.creatorId,
      firstName: lp.creator?.user.firstName ?? "",
      lastName: lp.creator?.user.lastName ?? "",
    },
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
      // 1) Maak de LearningPath

      console.log("LEERPAD MAKEN")
      console.log("LEERPAD MAKEN")
      console.log(data.nodes);
      console.log("LEERPAD MAKEN")
      console.log("LEERPAD MAKEN")
      console.log("LEERPAD MAKEN")
      

      const createdPath = await tx.learningPath.create({
        data: {
          title: data.title,
          language: data.language,
          description: data.description || "",
          image: data.image ?? null,
          num_nodes: data.nodes?.length || 0,
          num_nodes_left: 0,
          creatorId: teacherId,
          hruid: `lp-${Date.now()}-${Math.floor(Math.random() * 100000)}`,
        },
      });

      // 2) Maak de nodes en bewaar de mapping draftId → node.nodeId
      const draftToNodeId = new Map<number, string>();
      for (let position = 0; position < data.nodes.length; position++) {
        const nodeData = data.nodes[position];

        // validatie zoals voorheen…
        if (nodeData.isExternal) {
          await validateDwengoObject(
            nodeData.dwengoHruid!,
            nodeData.dwengoLanguage!,
            nodeData.dwengoVersion!,
          );
        } else {
          if (!nodeData.localLearningObjectId) {
            throw new BadRequestError("Missing localLearningObjectId for local node.");
          }
          await LocalLearningObjectService.getLearningObjectById(
            nodeData.localLearningObjectId,
          );
        }

        const node = await tx.learningPathNode.create({
          data: {
            learningPathId: createdPath.id,
            isExternal: nodeData.isExternal,
            localLearningObjectId: nodeData.isExternal ? null : nodeData.localLearningObjectId,
            dwengoHruid: nodeData.isExternal ? nodeData.dwengoHruid : null,
            dwengoLanguage: nodeData.isExternal ? nodeData.dwengoLanguage : null,
            dwengoVersion: nodeData.isExternal ? nodeData.dwengoVersion : null,
            start_node: position === 0,
            position,
          },
        });

        draftToNodeId.set(nodeData.draftId, node.nodeId);
      }

      // 3) Bereid transities voor

      interface TransDef {
        nodeId: string;
        nextNodeId: string;
        default: boolean;
        condition?: string;
        learningPathId: string;
      }
      const toCreate: TransDef[] = [];

      // 3a) Default‐transities per branch‐groep
      const groups = new Map<string, LocalLearningPathData['nodes']>();
      for (const nd of data.nodes) {
        const key = `${nd.parentNodeId ?? 'ROOT'}|${nd.viaOptionIndex ?? 'null'}`;
        if (!groups.has(key)) groups.set(key, []);
        groups.get(key)!.push(nd);
      }
      for (const group of groups.values()) {
        // behoud de volgorde zoals in data.nodes
        if (group != undefined) {
          for (let i = 0; i < group.length - 1; i++) {
            const from = draftToNodeId.get(group[i].draftId)!;
            const to = draftToNodeId.get(group[i + 1].draftId)!;
            toCreate.push({ nodeId: from, nextNodeId: to, default: true, learningPathId: createdPath.id });
          }
        }
      }

      // 3b) Branch‐transities voor elke MC-node
      for (const nd of data.nodes) {
        if (nd.learningObject.contentType === 'EVAL_MULTIPLE_CHOICE') {
          const children = data.nodes.filter(
            (c) => c.parentNodeId == nd.draftId
          );
          for (const c of children) {
            const from = draftToNodeId.get(nd.draftId)!;
            const to = draftToNodeId.get(c.draftId)!;
            toCreate.push({
              nodeId: from,
              nextNodeId: to,
              default: false,
              condition: c.viaOptionIndex!.toString(),
              learningPathId: createdPath.id,
            });
          }
        }
      }

      // 4) Schrijf alle transities weg in de database
      for (const tr of toCreate) {
        await tx.learningPathTransition.create({ data: tr });
      }

      return createdPath;
    });
  }
  async updateLearningPath(
    pathId: string,
    data: LocalLearningPathData,
  ): Promise<LearningPath> {
    // 1) Haal de creatorId op, om bij recreate te kunnen gebruiken
    const existing = await handlePrismaQuery(() =>
      prisma.learningPath.findUnique({
        where: { id: pathId },
        select: { creatorId: true },
      })
    );
    if (!existing) {
      throw new NotFoundError(`Learning path ${pathId} not found`);
    }
    const teacherId = existing.creatorId;

    // 2) Verwijder het volledige leerpad (cascade verwijdert nodes & transitions)
    await handlePrismaTransaction(prisma, async (tx) => {
      await tx.learningPath.delete({
        where: { id: pathId },
      });
    });

    // 3) Maak het leerpad opnieuw aan met exact dezelfde data
    //    We casten naar RequiredLocalLearningPathData omdat createLearningPath dat verwacht
    return this.createLearningPath(
      teacherId,
      data as Required<LocalLearningPathData>,
    );
  }
  async getTransitionsByPath(pathId: string): Promise<LearningPathTransition[]> {
    return handlePrismaQuery(() =>
      prisma.learningPathTransition.findMany({
        where: { learningPathId: pathId },
        select: {
          nodeId: true,
          nextNodeId: true,
          default: true,
          condition: true,
        },
        orderBy: [
          { nodeId: 'asc' },    // groepeer per start-node
          { default: 'desc' },  // default-transities eerst
        ],
      })
    );
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

  async deleteAllLearningPathsForTeacher(
    teacherId: number
  ): Promise<void> {
    await handlePrismaTransaction(prisma, async (tx) => {
      // 1) Pak eerst alle path-IDs die bij deze teacher horen
      const paths = await tx.learningPath.findMany({
        where: { creatorId: teacherId },
        select: { id: true },
      });
      const pathIds = paths.map((p) => p.id);

      if (pathIds.length === 0) {
        return;
      }

      // 2) Haal alle node-IDs van die paths op
      const nodes = await tx.learningPathNode.findMany({
        where: { learningPathId: { in: pathIds } },
        select: { nodeId: true },
      });
      const nodeIds = nodes.map((n) => n.nodeId);

      // 3) Verwijder alle transitions waarin één van die nodes voorkomt
      await tx.learningPathTransition.deleteMany({
        where: {
          OR: [
            { nodeId: { in: nodeIds } },
            { nextNodeId: { in: nodeIds } },
          ],
        },
      });

      // 4) Verwijder alle nodes in die paths
      await tx.learningPathNode.deleteMany({
        where: { learningPathId: { in: pathIds } },
      });

      // 5) Verwijder tenslotte de leerpaden zelf
      await tx.learningPath.deleteMany({
        where: { id: { in: pathIds } },
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
      include: {
        creator: {
          include: {
            user: true,
          },
        },
      },
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
  ): Promise<any> {
    // 1) Probeer op id

    console.log("LEERPAD OPHALEN")
    console.log("LEERPAD OPHALEN")
    console.log("LEERPAD OPHALEN")
    const byId = await handlePrismaQuery(() =>
      prisma.learningPath.findUnique({ where: { id: idOrHruid }, include: {nodes: true, transitions: true} }),
    );

    // 2) Probeer op hruid als niet op id gevonden
    const lp =
      byId ??
      (await handlePrismaQuery(() =>
        prisma.learningPath.findUnique({
          where: { hruid: idOrHruid },
          include: {
            nodes: true,
            transitions: true,
            creator: {
              include: {
                user: true,
              },
            },
          },
        }),
      ));

    

    if (!lp) throw new NotFoundError("Learning path not found.");


    return lp;

    // Als geen progressie nodig is of geen studentId, geef alleen basis terug
    // if (!includeProgress) {
    //   return baseDto;
    // }

    // // Haal alle nodes van dit leerpad
    // const nodes = await prisma.learningPathNode.findMany({
    //   where: { learningPathId: lp.id },
    // });


    // // Voor elke node: bepaal done-status
    // const nodesWithProgress = await Promise.all(
    //   nodes.map(async (node) => {
    //     let done = false;
    //     const localObjId = node.localLearningObjectId;
    //     if (localObjId) {
    //       // Zoek studentProgress met relation filter op LearningObjectProgress
    //       const sp = await prisma.studentProgress.findFirst({
    //         where: {
    //           studentId,
    //           progress: {
    //             is: { learningObjectId: localObjId },
    //           },
    //         },
    //       });
    //       done = sp !== null;
    //     }
    //     return {
    //       nodeId: node.nodeId,
    //       isExternal: node.isExternal,
    //       localLearningObjectId: node.localLearningObjectId ?? undefined,
    //       dwengoHruid: node.dwengoHruid ?? undefined,
    //       done: done,
    //     };
    //   }),
    // );


    // return {
    //   ...baseDto,
    //   nodes: nodesWithProgress,
    // };
  }
}

const localLearningPathService = new LocalLearningPathService();
export default localLearningPathService;
