import { ContentType as PrismaContentType, LearningObject } from "@prisma/client";
import prisma from "../config/prisma";

export interface LocalLearningObjectData {
  title: string;
  description: string;
  contentType: string;          // Raw string from request
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
  rawHtml: string;                // nieuw veld
}

// Mapping van raw string naar Prisma enum
const contentTypeMap: Record<string, PrismaContentType> = {
  "text/plain": PrismaContentType.TEXT_PLAIN,
  "text/markdown": PrismaContentType.TEXT_MARKDOWN,
  "image/image-block": PrismaContentType.IMAGE_IMAGE_BLOCK,
  "image/image": PrismaContentType.IMAGE_IMAGE,
  "audio/mpeg": PrismaContentType.AUDIO_MPEG,
  "application/pdf": PrismaContentType.APPLICATION_PDF,
  "extern": PrismaContentType.EXTERN,
  "blockly": PrismaContentType.BLOCKLY,
  "video": PrismaContentType.VIDEO,
  "EVAL_MULTIPLE_CHOICE": PrismaContentType.EVAL_MULTIPLE_CHOICE,
  "EVAL_OPEN_QUESTION": PrismaContentType.EVAL_OPEN_QUESTION,
};

function parseContentType(raw: string): PrismaContentType {
  const ct = contentTypeMap[raw];
  if (!ct) {
    throw new Error(`Invalid contentType "${raw}"`);
  }
  return ct;
}

function sanitizeStringArray(arr?: (string | null)[]): string[] {
  return arr?.filter((s): s is string => typeof s === 'string' && s.trim() !== '') ?? [];
}

function sanitizeNumberArray(arr?: (number | null)[]): number[] {
  return arr?.filter((n): n is number => typeof n === 'number') ?? [];
}

export default class LocalLearningObjectService {
  static async createLearningObject(
    teacherId: number,
    data: LocalLearningObjectData
  ): Promise<LearningObject> {
    // 1) Maak het LearningObject aan
    const createdLO = await prisma.learningObject.create({
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
    });

    // 2) Sla de rawHtml op in LearningObjectRawHtml
    await prisma.learningObjectRawHtml.create({
      data: {
        learningObjectId: createdLO.id,
        rawHtml: data.rawHtml,
      },
    });

    return createdLO;
  }

  static async getAllLearningObjectsByTeacher(teacherId: number) {
    return prisma.learningObject.findMany({
      where: { creatorId: teacherId },
      orderBy: { createdAt: "desc" },
    });
  }

  static async getLearningObjectById(id: string) {
    return prisma.learningObject.findUnique({
      where: { id },
    });
  }

  static async updateLearningObject(
    id: string,
    data: Partial<LocalLearningObjectData>
  ) {
    // 1) Update basale velden van het leerobject

    const updatedLO = await prisma.learningObject.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
        contentType: data.contentType ? parseContentType(data.contentType) : undefined,
        keywords: data.keywords ? sanitizeStringArray(data.keywords) : undefined,
        targetAges: data.targetAges ? sanitizeNumberArray(data.targetAges) : undefined,
        teacherExclusive: data.teacherExclusive,
        skosConcepts: data.skosConcepts ? sanitizeStringArray(data.skosConcepts) : undefined,
        copyright: data.copyright,
        licence: data.licence,
        difficulty: data.difficulty,
        estimatedTime: data.estimatedTime,
        available: data.available,
        contentLocation: data.contentLocation,
      },
    });

    // 2) Upsert rawHtml
    if (data.rawHtml !== undefined) {
      await prisma.learningObjectRawHtml.upsert({
        where: { learningObjectId: updatedLO.id },
        create: {
          learningObjectId: updatedLO.id,
          rawHtml: data.rawHtml,
        },
        update: {
          rawHtml: data.rawHtml,
        },
      });
    }

    return updatedLO;
  }

  static async deleteLearningObject(id: string) {
    // door cascade in Prisma-schema wordt rawHtml ook mee-verwijderd
    return prisma.learningObject.delete({
      where: { id },
    });
  }

  static async getRawHtmlById(id: string): Promise<string | null> {
    const record = await prisma.learningObjectRawHtml.findUnique({
      where: { learningObjectId: id },
      select: { rawHtml: true },
    });
    return record ? record.rawHtml : null;
  }
  
}
