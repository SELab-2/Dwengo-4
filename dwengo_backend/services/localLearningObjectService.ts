import {
  ContentType as PrismaContentType,
  LearningObject,
  LearningPathNode,
} from "@prisma/client";

import prisma from "../config/prisma";
import {
  handlePrismaQuery,
  handleQueryWithExistenceCheck,
} from "../errors/errorFunctions";
import localLearningPathService from "./localLearningPathService";
import { LearningObjectDto } from "./dwengoLearningObjectService";
import { mapLocalToDto } from "./localDBLearningObjectService";

export interface LocalLearningObjectData {
  // De data die een teacher kan opgeven bij het aanmaken of updaten
  title: string;
  description: string;
  contentType: string; // Raw string from request
  keywords?: (string | null)[];
  targetAges?: (number | null)[];
  teacherExclusive?: boolean;
  skosConcepts?: (string | null)[];
  copyright?: string;
  licence?: string;
  difficulty?: number;
  estimatedTime?: number;
  available?: boolean;
  contentLocation?: string;
  rawHtml: string; // nieuw veld
}

// Mapping van raw string naar Prisma enum
const contentTypeMap: Record<string, PrismaContentType> = {
  "text/plain": PrismaContentType.TEXT_PLAIN,
  EVAL_MULTIPLE_CHOICE: PrismaContentType.EVAL_MULTIPLE_CHOICE,
  EVAL_OPEN_QUESTION: PrismaContentType.EVAL_OPEN_QUESTION,
};

function parseContentType(raw: string): PrismaContentType {
  const ct = contentTypeMap[raw];
  if (!ct) {
    throw new Error(`Invalid contentType "${raw}"`);
  }
  return ct;
}

function sanitizeStringArray(arr?: (string | null)[]): string[] {
  return (
    arr?.filter((s): s is string => typeof s === "string" && s.trim() !== "") ?? []
  );
}

function sanitizeNumberArray(arr?: (number | null)[]): number[] {
  return arr?.filter((n): n is number => typeof n === "number") ?? [];
}

export default class LocalLearningObjectService {
  /**
   * Maakt een nieuw leerobject aan in onze eigen databank.
   * Genereert een UUID voor het veld 'id' (Prisma-model heeft id: String @id).
   */
  static async createLearningObject(
    teacherId: number,
    data: LocalLearningObjectData,
  ): Promise<LearningObject> {
    // Prisma create (generic toegevoegd voor correcte typing)
    const createdLO = await handlePrismaQuery<LearningObject>(() =>
      prisma.learningObject.create({
        data: {
          hruid: `${data.title.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}`,
          language: "nl",
          title: data.title,
          description: data.description,
          contentType: parseContentType(data.contentType),
          keywords: sanitizeStringArray(data.keywords),
          targetAges: sanitizeNumberArray(data.targetAges),
          teacherExclusive: data.teacherExclusive ?? false,
          skosConcepts: sanitizeStringArray(data.skosConcepts),
          copyright: data.copyright ?? "",
          licence: data.licence ?? "CC BY Dwengo",
          difficulty: data.difficulty ?? 1,
          estimatedTime: data.estimatedTime ?? 0,
          available: data.available ?? true,
          contentLocation: data.contentLocation ?? "",
          creatorId: teacherId,
        },
      }),
    );

    // Added: sla de rawHtml op in LearningObjectRawHtml
    if (data.rawHtml !== undefined) {
      await handlePrismaQuery(() =>
        prisma.learningObjectRawHtml.create({
          data: {
            learningObjectId: createdLO.id,
            rawHtml: data.rawHtml,
          },
        }),
      );
    }

    return createdLO;
  }

  /**
   * Geeft alle leerobjecten terug die door een bepaalde teacher zijn aangemaakt.
   * Of (afhankelijk van je wensen) alle leerobjecten in de DB als je dat wilt.
   */
  static async getAllLearningObjectsByTeacher(
    teacherId: number,
  ): Promise<LearningObjectDto[]> {
    return await handlePrismaQuery<LearningObject[]>(() =>
      prisma.learningObject.findMany({
        where: { creatorId: teacherId },
        orderBy: { createdAt: "desc" },
        include: {
          LearningObjectRawHtml: true,
        },
      }),
    ).then((objects) => objects.map((obj) => mapLocalToDto(obj)));
  }

  /**
   * Haalt één leerobject op. Optioneel kun je checken of de aanvrager
   * wel de creator is, als je dat in de controller wilt enforce'n.
   */
  static async getLearningObjectById(id: string): Promise<LearningObject> {
    return await handleQueryWithExistenceCheck<LearningObject>(
      () =>
        prisma.learningObject.findUnique({
          where: { id: id || "" },
        }),
      "Learning object not found.",
    );
  }

  /**
   * Haalt de rawHtml op voor een leerobject.
   */
  static async getRawHtmlById(id: string): Promise<string | null> {
    // Added: nieuwe methode
    const record = await handlePrismaQuery<{ rawHtml: string } | null>(() =>
      prisma.learningObjectRawHtml.findUnique({
        where: { learningObjectId: id },
        select: { rawHtml: true },
      }),
    );
    return record ? record.rawHtml : null;
  }

  /**
   * Update van een bestaand leerobject. We gaan ervan uit dat je al
   * gecontroleerd hebt of de teacher mag updaten (bv. of teacherId === creatorId).
   */
  static async updateLearningObject(
    id: string,
    data: Partial<LocalLearningObjectData>,
  ): Promise<LearningObject> {
    // Prisma update (generic toegevoegd voor correcte typing)
    const updatedLO = await handlePrismaQuery<LearningObject>(() =>
      prisma.learningObject.update({
        where: { id },
        data: {
          // Als we hruid gelijk stellen aan de titel, dan zal hruid hier ook moeten aangepast worden.

          title: data.title,
          description: data.description,
          contentType: data.contentType
            ? parseContentType(data.contentType)
            : undefined,
          keywords: data.keywords ? sanitizeStringArray(data.keywords) : undefined,
          targetAges: data.targetAges
            ? sanitizeNumberArray(data.targetAges)
            : undefined,
          teacherExclusive: data.teacherExclusive,
          skosConcepts: data.skosConcepts
            ? sanitizeStringArray(data.skosConcepts)
            : undefined,
          copyright: data.copyright,
          licence: data.licence,
          difficulty: data.difficulty,
          estimatedTime: data.estimatedTime,
          available: data.available,
          contentLocation: data.contentLocation,
        },
      }),
    );

    // Added: upsert rawHtml in LearningObjectRawHtml
    if (data.rawHtml !== undefined) {
      await handlePrismaQuery(() =>
        prisma.learningObjectRawHtml.upsert({
          where: { learningObjectId: updatedLO.id },
          create: {
            learningObjectId: updatedLO.id,
            rawHtml: data.rawHtml || "",
          },
          update: {
            rawHtml: data.rawHtml,
          },
        }),
      );
    }

    return updatedLO;
  }

  /**
   * Verwijdert een leerobject op basis van zijn id.
   */

  static async deleteLearningObject(id: string): Promise<LearningObject> {
    // check if part of a learning path, if so delete corresponding nodes
    const learningPathNodes = await handlePrismaQuery(() =>
      prisma.learningPathNode.findMany({
        where: { localLearningObjectId: id },
      }),
    );
    console.log(learningPathNodes);

    if (learningPathNodes.length > 0) {
      const groupedNodes = learningPathNodes.reduce<
        Record<string, LearningPathNode[]>
      >((acc, node) => {
        if (!node.learningPathId) return acc; // skip nodes without a learningPathId
        if (!acc[node.learningPathId]) {
          acc[node.learningPathId] = [];
        }
        acc[node.learningPathId].push(node);
        return acc;
      }, {});

      for (const learningPathId of Object.keys(groupedNodes)) {
        const path = await handlePrismaQuery(() =>
          prisma.learningPath.findUnique({
            where: { id: learningPathId },
            include: {
              nodes: {
                orderBy: { position: 'asc' },
              },
            },
          }),
        );

        // if (path) {
        //   // Build NodeMetadata array for updateLearningPath
        //   const newNodes: NodeMetadata[] = path.nodes
        //     .filter(
        //       node =>
        //         !groupedNodes[learningPathId].some(
        //           groupedNode => groupedNode.nodeId === node.nodeId,
        //         ),
        //     )
        //     .map(node => ({
        //       nodeId: node.nodeId,
        //       localLearningObjectId:
        //         node.localLearningObjectId ?? undefined,
        //       dwengoHruid: node.dwengoHruid ?? undefined,
        //       dwengoLanguage: node.dwengoLanguage ?? undefined,
        //       dwengoVersion: node.dwengoVersion ?? undefined,
        //       position: node.position,
        //       // required NodeMetadata fields:
        //       draftId: undefined,
        //       parentNodeId: undefined,
        //       learningObject: undefined,
        //       viaOptionIndex: 0,
        //     }));

        //   await localLearningPathService.updateLearningPath(learningPathId, {
        //     title: path.title,
        //     language: path.language,
        //     nodes: newNodes,
        //   });
        // }
      }
    }

    return handlePrismaQuery<LearningObject>(() =>
      prisma.learningObject.delete({
        where: { id },
      }),
    );
  }

}
