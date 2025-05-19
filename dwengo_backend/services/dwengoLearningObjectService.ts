import { dwengoAPI } from "../config/dwengoAPI";
import { throwCorrectNetworkError } from "../errors/errorFunctions";
import {
  NotFoundError,
  UnauthorizedError,
  UnavailableError,
} from "../errors/errors";

/**
 * De mogelijke content types (zie je enum in de oorspronkelijke code).
 */

enum ContentType {
  // Dit zijn momenteel "unused variables" dus eslint wil dat deze voorafgegaan worden door een "_"
  _TEXT_PLAIN = "text/plain",
  _TEXT_MARKDOWN = "text/markdown",
  _IMAGE_IMAGE_BLOCK = "image/image-block",
  _IMAGE_IMAGE = "image/image",
  _AUDIO_MPEG = "audio/mpeg",
  _VIDEO = "video",
  _EVAL_MULTIPLE_CHOICE = "evaluation/multiple-choice",
  _EVAL_OPEN_QUESTION = "evaluation/open-question",
}

/**
 * Mapping van Dwengo string → onze enum
 */

const permittedContentTypes = {
  "text/plain": ContentType._TEXT_PLAIN,
  "text/markdown": ContentType._TEXT_MARKDOWN,
  "image/image-block": ContentType._IMAGE_IMAGE_BLOCK,
  "image/image": ContentType._IMAGE_IMAGE,
  "audio/mpeg": ContentType._AUDIO_MPEG,
  video: ContentType._VIDEO,
  "evaluation/multiple-choice": ContentType._EVAL_MULTIPLE_CHOICE,
  "evaluation/open-question": ContentType._EVAL_OPEN_QUESTION,
};

interface DwengoLearningObject {
  _id?: string;
  uuid?: string;
  hruid?: string;
  version?: number;
  language?: string;
  title?: string;
  description?: string;
  content_type?: string;
  keywords?: string[];
  target_ages?: number[];
  teacher_exclusive?: boolean;
  skos_concepts?: string[];
  copyright?: string;
  licence?: string;
  difficulty?: number;
  estimated_time?: number;
  available?: boolean;
  content_location?: string;
  created_at?: string;
  updatedAt?: string;
}

export interface LearningObjectDto {
  id: string;
  uuid: string;
  hruid: string;
  version: number;
  language: string;
  title: string;
  description: string;
  contentType: string;
  keywords: string[];
  targetAges: number[];
  teacherExclusive: boolean;
  skosConcepts: string[];
  copyright: string;
  licence: string;
  difficulty: number;
  estimatedTime: number;
  available: boolean;
  contentLocation?: string;
  createdAt: string;
  updatedAt: string;
  creatorId?: number; // only for local learning objects
  origin: "dwengo" | "local";
}

export interface LearningObjectDtoWithRaw extends LearningObjectDto {
  raw?: string;
}

/**
 * Converteer Dwengo-object naar onze LearningObjectDto
 */
function mapDwengoToLocal(
  dwengoObj: DwengoLearningObject,
): LearningObjectDtoWithRaw {
  return {
    id: dwengoObj._id ?? "",
    uuid: dwengoObj.uuid ?? "",
    hruid: dwengoObj.hruid ?? "",
    version: dwengoObj.version ?? 1,
    language: dwengoObj.language ?? "",
    title: dwengoObj.title ?? "",
    description: dwengoObj.description ?? "",
    contentType:
      permittedContentTypes[
        (dwengoObj.content_type as keyof typeof permittedContentTypes) ?? ""
      ] ?? ContentType._TEXT_PLAIN,
    keywords: dwengoObj.keywords ?? [],
    targetAges: dwengoObj.target_ages ?? [],
    teacherExclusive: Boolean(dwengoObj.teacher_exclusive),
    skosConcepts: dwengoObj.skos_concepts ?? [],
    copyright: dwengoObj.copyright ?? "",
    licence: dwengoObj.licence ?? "",
    difficulty: dwengoObj.difficulty ?? 0,
    estimatedTime: dwengoObj.estimated_time ?? 0,
    available: dwengoObj.available ?? false,
    contentLocation: dwengoObj.content_location ?? "",
    createdAt: dwengoObj.created_at ?? "",
    updatedAt: dwengoObj.updatedAt ?? "",
    origin: "dwengo",
  };
}

// Alle Dwengo-objects
export async function fetchAllDwengoObjects(
  isTeacher: boolean,
): Promise<LearningObjectDto[]> {
  try {
    const params: Record<string, any> = {};
    if (!isTeacher) {
      params.teacher_exclusive = false;
      params.available = true;
    }
    const response = await dwengoAPI.get("/api/learningObject/search", {
      params,
    });
    const dwengoData: DwengoLearningObject[] = response.data;
    return dwengoData.map(mapDwengoToLocal);
  } catch (error) {
    throwCorrectNetworkError(
      error as Error,
      "Unable to fetch learning objects from the Dwengo API.",
    );
  }
  // Dit zou nooit mogen gebeuren
  return [];
}

// Eén Dwengo-object op basis van _id
// the dwengo API doesn't implement this correctly, so don't use this function until it's fixed
export async function fetchDwengoObjectById(
  id: string,
  isTeacher: boolean,
): Promise<LearningObjectDto> {
  try {
    const params = { _id: id };
    const response = await dwengoAPI.get("/api/learningObject/getMetadata", {
      params,
    });

    checkAll(
      response.data,
      `Dwengo learning object with id ${id} not found.`,
      isTeacher,
    );

    const dwengoObj: DwengoLearningObject = response.data;
    return mapDwengoToLocal(dwengoObj);
  } catch (error) {
    throwCorrectNetworkError(
      error as Error,
      "Unable to fetch the learning object from the Dwengo API.",
    );
  }
  throw new Error("Unexpected state reached in fetchDwengoObjectById."); // Dit zou nooit mogen gebeuren
}

// Eén Dwengo-object op basis van _id
/*export async function fetchDwengoObjectByIdRaw(
  id: string,
  isTeacher: boolean,
): Promise<LearningObjectDto> {
  try {
    const params = { _id: id };
    const response = await dwengoAPI.get("/api/learningObject/getRaw", {
      params,
    });
    checkAll(response.data, "Dwengo learning object not found.", isTeacher);
    const dwengoObj: DwengoLearningObject = response.data;
    return mapDwengoToLocal(dwengoObj);
  } catch (error: any) {
    throwCorrectNetworkError(
      error as Error,
      "Could not fetch the learning object from the Dwengo API.",
    );
  }
  // Dit mag nooit gebeuren
  return {} as LearningObjectDto;
}*/

// [NIEUW] Dwengo-object op basis van hruid, language, version
export async function fetchDwengoObjectByHruidLangVersion(
  hruid: string,
  language: string,
  version: number,
  isTeacher: boolean,
): Promise<LearningObjectDto> {
  try {
    // Dwengo-API: /api/learningObject/getMetadata?hruid=...&language=...&version=...
    const params = { hruid, language, version };
    const response = await dwengoAPI.get("/api/learningObject/getMetadata", {
      params,
    });

    checkAll(
      response.data,
      `Dwengo learning object with hruid=${hruid}, language=${language}, version=${version} not found.`,
      isTeacher,
    );

    const dwengoObj: DwengoLearningObject = response.data;
    return mapDwengoToLocal(dwengoObj);
  } catch (error) {
    throwCorrectNetworkError(
      error as Error,
      "Unable to fetch the learning object from the Dwengo API.",
    );
  }
  // Dit mag nooit gebeuren
  throw new Error();
}

// Zoeken Dwengo-objects
export async function searchDwengoObjects(
  isTeacher: boolean,
  searchTerm: string,
): Promise<LearningObjectDto[]> {
  try {
    const params: Record<string, any> = {};
    if (!isTeacher) {
      params.teacher_exclusive = false;
      params.available = true;
    }
    if (searchTerm) {
      params.searchTerm = searchTerm;
    }
    const response = await dwengoAPI.get("/api/learningObject/search", {
      params,
    });

    const dwengoData: DwengoLearningObject[] = response.data;
    return dwengoData.map(mapDwengoToLocal);
  } catch (error) {
    throwCorrectNetworkError(
      error as Error,
      "Unable to fetch learning objects from the Dwengo API.",
    );
  }
  // Zou niet mogen gebeuren
  return [];
}

// Haal leerobjecten op voor een leerpad (Dwengo)
export async function getDwengoObjectsForPath(
  pathId: string,
  isTeacher: boolean,
): Promise<LearningObjectDtoWithRaw[]> {
  try {
    const pathResp = await dwengoAPI.get(`/api/learningPath/${pathId}`);
    const learningPath = pathResp.data;
    checkFetchedObject(learningPath, `Learning path with id=${pathId} not found.`);
    const nodes = learningPath.nodes || [];
    const results = await Promise.all(
      nodes.map(
        async (node: { learningobject_hruid: any; version: any; language: any }) => {
          try {
            const params = {
              hruid: node.learningobject_hruid,
              version: node.version,
              language: node.language,
            };

            const metaRes = await dwengoAPI.get("/api/learningObject/getMetadata", {
              params,
            });

            // throw error if path contains invalid learning object
            checkFetchedObject(
              metaRes.data,
              `Dwengo learning object (hruid: ${params.hruid}) not found.`,
            );

            // skip this object if it's teacher exclusive and user is not a teacher
            // or if it's not available (but don't throw an error)
            if (
              (!isTeacher && metaRes.data.teacher_exclusive) ||
              !metaRes.data.available
            ) {
              return null;
            }

            // fetch the raw content
            const rawRes = await dwengoAPI.get("/api/learningObject/getRaw", {
              params,
            });

            // throw error if learning object content not found
            if (!rawRes.data) {
              throw new NotFoundError("Learning object not found.");
            }
            const dto = mapDwengoToLocal(metaRes.data as DwengoLearningObject);
            dto.raw = rawRes.data;
            return dto;
          } catch (error) {
            throwCorrectNetworkError(
              error as Error,
              "Could not fetch learning object related to node.",
            );
          }
        },
      ),
    );
    return results.filter((x): x is LearningObjectDtoWithRaw => x !== null);
  } catch (error) {
    throwCorrectNetworkError(
      error as Error,
      "Could not fetch the desired learning path.",
    );
    return [];
  }
}

/////////////////////////////////////////
// Helper functies voor error handling //
/////////////////////////////////////////

function checkFetchedObject<T>(fetchedObject: T | null, notFoundMessage: string) {
  if (!fetchedObject || typeof fetchedObject !== "object") {
    // dwengo API returns error string if object not found (so check type aswell)
    throw new NotFoundError(notFoundMessage);
  }
}

function checkTeacherExclusive(dwengoObj: DwengoLearningObject, isTeacher: boolean) {
  if (!isTeacher && dwengoObj.teacher_exclusive) {
    throw new UnauthorizedError("This learning object is only for teachers.");
  }
}

function checkAvailability(dwengoObj: DwengoLearningObject) {
  if (!dwengoObj.available) {
    throw new UnavailableError("This learning object is temporarily not available.");
  }
}

function checkAll(
  dwengoObj: DwengoLearningObject | null,
  notFoundMessage: string,
  isTeacher: boolean,
) {
  checkFetchedObject(dwengoObj, notFoundMessage);
  checkAvailability(dwengoObj!);
  checkTeacherExclusive(dwengoObj!, isTeacher);
}

// Dwengo-object op basis van hruid (raw)
/*export async function fetchDwengoObjectRawByHruid(
  hruid: string,
): Promise<DwengoLearningObject | null> {
  try {
    const params = { hruid };
    const response = await dwengoAPI.get("/api/learningObject/getRaw", {
      params,
    });
    return response.data;
  } catch (error: any) {
    if (error.response && error.response.status === 404) {
      return null;
    }
    console.error("Fout bij fetchDwengoObjectRawByHruid:", error);
    return null;
  }
}*/

// check if dwengo object exists
export async function validateDwengoObject(
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
