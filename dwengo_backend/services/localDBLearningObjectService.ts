import { PrismaClient, LearningObject } from "@prisma/client";
import { LearningObjectDto } from "./dwengoLearningObjectService";
import { handlePrismaQuery } from "../errors/errorFunctions";
import {
  NotFoundError,
  UnauthorizedError,
  UnavailableError,
} from "../errors/errors";

const prisma = new PrismaClient();

/**
 * Converteert een Prisma LearningObject record naar ons LearningObjectDto
 * (origin = "local")
 */
function mapLocalToDto(
  localObj: LearningObject,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _isTeacher: boolean,
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
    origin: "local",
  };
}

/**
 * Haal alle lokale leerobjecten op,
 * filter op teacherExclusive/available als de gebruiker geen teacher is.
 */
export async function getLocalLearningObjects(
  isTeacher: boolean,
): Promise<LearningObjectDto[]> {
  const whereClause = isTeacher
    ? {}
    : { teacherExclusive: false, available: true };

  const localObjects: LearningObject[] = await handlePrismaQuery(() =>
    prisma.learningObject.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
    }),
  );

  return localObjects.map((obj) => mapLocalToDto(obj, isTeacher));
}

/**
 * Haal 1 lokaal leerobject op (check of user het mag zien).
 */
export async function getLocalLearningObjectById(
  id: string,
  isTeacher: boolean,
): Promise<LearningObjectDto> {
  const localObj = await handlePrismaQuery(() =>
    prisma.learningObject.findUnique({ where: { id } }),
  );

  if (!localObj) {
    throw new NotFoundError(`Local learning object with id=${id} not found.`);
  }

  if (!isTeacher && localObj.teacherExclusive) {
    throw new UnauthorizedError(
      `Local learning object with hruid=${localObj.hruid}, language=${localObj.language}, version=${localObj.version} is teacher exclusive.`,
    );
  }

  if (!localObj.available) {
    throw new UnavailableError(
      `Local learning object with hruid=${localObj.hruid}, language=${localObj.language}, version=${localObj.version} is temporarily not available.`,
    );
  }

  return mapLocalToDto(localObj, isTeacher);
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

  return localObjects.map((obj) => mapLocalToDto(obj, isTeacher));
}

// [NIEUW] Haal lokaal leerobject op via hruid+language+version
export async function getLocalLearningObjectByHruidLangVersion(
  hruid: string,
  language: string,
  version: number,
  isTeacher: boolean,
): Promise<LearningObjectDto> {
  const localObj = await handlePrismaQuery(() =>
    prisma.learningObject.findUnique({
      where: {
        hruid,
        language,
        version,
      },
    }),
  );

  if (!localObj) {
    throw new NotFoundError(
      `Local learning object with hruid=${hruid}, language=${language}, version=${version} not found.`,
    );
  }

  if (!isTeacher && localObj.teacherExclusive) {
    throw new UnauthorizedError(
      `Local learning object with hruid=${hruid}, language=${language}, version=${version} is teacher exclusive.`,
    );
  }

  if (!localObj.available) {
    throw new UnavailableError(
      `Local learning object with hruid=${hruid}, language=${language}, version=${version} is temporarily not available.`,
    );
  }

  return mapLocalToDto(localObj, isTeacher);
}
