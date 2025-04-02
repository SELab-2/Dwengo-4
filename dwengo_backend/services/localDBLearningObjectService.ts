import { LearningObject } from "@prisma/client";
import { LearningObjectDto } from "./dwengoLearningObjectService";

import prisma from "../config/prisma";

/**
 * Converteert een Prisma LearningObject record naar ons LearningObjectDto
 * (origin = "local")
 */
function mapLocalToDto(localObj: LearningObject): LearningObjectDto {
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
    origin: "local",
  };
}

/**
 * Haal alle lokale leerobjecten op,
 * filter op teacherExclusive/available als de gebruiker geen teacher is.
 */
export async function getLocalLearningObjects(isTeacher: boolean): Promise<LearningObjectDto[]> {
  const whereClause = isTeacher ? {} : { teacherExclusive: false, available: true };

  const localObjects = await prisma.learningObject.findMany({
    where: whereClause,
    orderBy: { createdAt: "desc" },
  });

  return localObjects.map((obj) => mapLocalToDto(obj));
}

/**
 * Haal 1 lokaal leerobject op (check of user het mag zien).
 */
export async function getLocalLearningObjectById(
  id: string,
  isTeacher: boolean
): Promise<LearningObjectDto | null> {
  const localObj = await prisma.learningObject.findUnique({ where: { id } });
  if (!localObj) return null;

  if (!isTeacher && (localObj.teacherExclusive || !localObj.available)) {
    return null;
  }
  return mapLocalToDto(localObj);
}

/**
 * Doorzoeken van de lokale DB op basis van searchTerm in de title/description/keywords.
 */
export async function searchLocalLearningObjects(
  isTeacher: boolean,
  searchTerm: string
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

  const localObjects = await prisma.learningObject.findMany({
    where: whereClause,
    orderBy: { createdAt: "desc" },
  });

  return localObjects.map((obj) => mapLocalToDto(obj));
}

// [NIEUW] Haal lokaal leerobject op via hruid+language+version
export async function getLocalLearningObjectByHruidLangVersion(
  hruid: string,
  language: string,
  version: number,
  isTeacher: boolean
): Promise<LearningObjectDto | null> {
  const localObj = await prisma.learningObject.findUnique({
    where: {
      hruid,
      language,
      version,
    },
  });

  if (!localObj) return null;

  if (!isTeacher && (localObj.teacherExclusive || !localObj.available)) {
    return null;
  }
  return mapLocalToDto(localObj);
}
