import { LearningObject, LearningObjectRawHtml } from "@prisma/client";
import {
  getDwengoObjectForPath,
  LearningObjectDto,
} from "./dwengoLearningObjectService";
import {
  handlePrismaQuery,
  handleQueryWithExistenceCheck,
} from "../errors/errorFunctions";
import { AccessDeniedError, UnavailableError } from "../errors/errors";

import prisma from "../config/prisma";

/**
 * Converteert een Prisma LearningObject record naar ons LearningObjectDto
 * (origin = "local")
 *
 * the local learning object can also optionally include the raw HTML content
 */
export function mapLocalToDto(
  localObj: LearningObject & {
    LearningObjectRawHtml?: LearningObjectRawHtml | null;
  },
): LearningObjectDto {
  return {
    id: localObj.id,
    uuid: localObj.uuid,
    hruid: localObj.hruid,
    version: localObj.version,
    language: localObj.language,
    title: localObj.title,
    description: localObj.description,
    contentType: localObj.contentType,
    keywords: localObj.keywords,
    targetAges: localObj.targetAges,
    teacherExclusive: localObj.teacherExclusive,
    skosConcepts: localObj.skosConcepts,
    copyright: localObj.copyright,
    licence: localObj.licence,
    difficulty: localObj.difficulty,
    estimatedTime: localObj.estimatedTime,
    available: localObj.available,
    contentLocation: localObj.contentLocation ?? "",
    createdAt: localObj.createdAt.toISOString(),
    updatedAt: localObj.updatedAt.toISOString(),
    creatorId: localObj.creatorId ?? undefined,
    origin: "local",
    raw: localObj.LearningObjectRawHtml
      ? localObj.LearningObjectRawHtml.rawHtml
      : undefined,
  };
}

/**
 * Haal alle lokale leerobjecten op,
 * filter op teacherExclusive/available als de gebruiker geen teacher is.
 */
export async function getLocalLearningObjects(
  isTeacher: boolean,
): Promise<LearningObjectDto[]> {
  const whereClause = isTeacher ? {} : { teacherExclusive: false, available: true };

  const localObjects: LearningObject[] = await handlePrismaQuery(() =>
    prisma.learningObject.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
    }),
  );

  return localObjects.map((obj) => mapLocalToDto(obj));
}

/**
 * Haal 1 lokaal leerobject op (check of user het mag zien).
 */
export async function getLocalLearningObjectById(
  id: string,
  isTeacher: boolean,
): Promise<LearningObjectDto> {
  const localObj = await handleQueryWithExistenceCheck(
    () => prisma.learningObject.findUnique({ where: { id } }),
    `Local learning object not found.`,
  );

  if (!isTeacher && localObj.teacherExclusive) {
    throw new AccessDeniedError(
      `Local learning object with hruid=${localObj.hruid}, language=${localObj.language}, version=${localObj.version} is teacher exclusive.`,
    );
  }

  if (!localObj.available) {
    throw new UnavailableError(
      `Local learning object with hruid=${localObj.hruid}, language=${localObj.language}, version=${localObj.version} is temporarily not available.`,
    );
  }

  return mapLocalToDto(localObj);
}

/**
 * Doorzoeken van de lokale DB op basis van searchTerm in de title/description/keywords.
 */
export async function searchLocalLearningObjects(
  isTeacher: boolean,
  searchTerm: string,
): Promise<LearningObjectDto[]> {
  const whereClause: any = {
    OR: [
      { title: { contains: searchTerm, mode: "insensitive" } },
      { description: { contains: searchTerm, mode: "insensitive" } },
      { keywords: { has: searchTerm } },
    ],
  };

  if (!isTeacher) {
    whereClause.AND = [{ teacherExclusive: false }, { available: true }];
  }

  const localObjects = await handlePrismaQuery(() =>
    prisma.learningObject.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
    }),
  );

  return localObjects.map((obj) => mapLocalToDto(obj));
}

// [NIEUW] Haal lokaal leerobject op via hruid+language+version
export async function getLocalLearningObjectByHruidLangVersion(
  hruid: string,
  language: string,
  version: number,
  isTeacher: boolean,
): Promise<LearningObjectDto> {
  const localObj = await handleQueryWithExistenceCheck(
    () =>
      prisma.learningObject.findUnique({
        where: {
          hruid,
          language,
          version,
        },
      }),
    `Local learning object with hruid=${hruid}, language=${language}, version=${version} not found.`,
  );

  if (!isTeacher && localObj.teacherExclusive) {
    throw new AccessDeniedError(
      `Local learning object with hruid=${hruid}, language=${language}, version=${version} is teacher exclusive.`,
    );
  }

  if (!localObj.available) {
    throw new UnavailableError(
      `Local learning object with hruid=${hruid}, language=${language}, version=${version} is temporarily not available.`,
    );
  }

  return mapLocalToDto(localObj);
}

/**
 * Get all learning objects for a specific learning path
 */
export async function getLearningObjectsForLocalPath(
  pathId: string,
  isTeacher: boolean,
): Promise<LearningObjectDto[]> {
  // check if path exists
  const path = await handleQueryWithExistenceCheck(
    () =>
      prisma.learningPath.findUnique({
        where: { id: pathId },
        include: {
          nodes: {
            orderBy: { position: "asc" },
          },
        },
      }),
    `Learning path with id=${pathId} not found.`,
  );

  // get all learning objects for this path
  const objects: LearningObjectDto[] = [];
  for (const node of path.nodes) {
    let obj: LearningObjectDto | null;
    if (node.isExternal) {
      // dwengo object, fetch from dwengo api
      obj = await getDwengoObjectForPath(
        node.dwengoHruid!,
        node.dwengoLanguage!,
        node.dwengoVersion!,
        isTeacher,
      );

      // add to objects if not null
    } else {
      // local object, fetch from local db
      const localObj = await handlePrismaQuery(() =>
        prisma.learningObject.findUnique({
          where: {
            id: node.localLearningObjectId!,
            teacherExclusive: isTeacher ? undefined : false,
            available: true,
          },
          include: {
            LearningObjectRawHtml: true,
          },
        }),
      );
      obj = localObj ? mapLocalToDto(localObj) : null;
    }

    if (obj) {
      objects.push(obj);
    }
  }
  return objects;
}
