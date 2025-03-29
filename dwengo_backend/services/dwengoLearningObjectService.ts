import { dwengoAPI } from "../config/dwengoAPI";

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
 * Mapping van Dwengo string => onze enum
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
  origin: "dwengo" | "local";
}

/**
 * Converteer Dwengo-object naar onze LearningObjectDto
 */
function mapDwengoToLocal(dwengoObj: DwengoLearningObject): LearningObjectDto {
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
    console.error("Fout bij fetchAllDwengoObjects:", error);
    throw new Error("Dwengo API call mislukt.");
  }
}

// Eén Dwengo-object op basis van _id
export async function fetchDwengoObjectById(
  id: string,
  isTeacher: boolean,
): Promise<LearningObjectDto | null> {
  try {
    const params = { _id: id };
    const response = await dwengoAPI.get("/api/learningObject/getMetadata", {
      params,
    });
    const dwengoObj: DwengoLearningObject = response.data;
    const mapped = mapDwengoToLocal(dwengoObj);

    if (!isTeacher && (mapped.teacherExclusive || !mapped.available)) {
      return null;
    }
    return mapped;
  } catch (error: any) {
    if (error.response && error.response.status === 404) {
      return null;
    }
    console.error("Fout bij fetchDwengoObjectById:", error);
    return null;
  }
}

// [NIEUW] Dwengo-object op basis van hruid, language, version
export async function fetchDwengoObjectByHruidLangVersion(
  hruid: string,
  language: string,
  version: number,
  isTeacher: boolean,
): Promise<LearningObjectDto | null> {
  try {
    // Dwengo-API: /api/learningObject/getMetadata?hruid=...&language=...&version=...
    const params = { hruid, language, version };
    console.log("Dwengo params:", params);

    const response = await dwengoAPI.get("/api/learningObject/getMetadata", {
      params,
    });
    const dwengoObj: DwengoLearningObject = response.data;
    const mapped = mapDwengoToLocal(dwengoObj);

    if (!isTeacher && (mapped.teacherExclusive || !mapped.available)) {
      return null;
    }
    return mapped;
  } catch (error: any) {
    if (error.response && error.response.status === 404) {
      return null;
    }
    console.error("Fout bij fetchDwengoObjectByHruidLangVersion:", error);
    return null;
  }
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
    console.error("Fout bij searchDwengoObjects:", error);
    throw new Error("Dwengo API search mislukt.");
  }
}

// Haal leerobjecten op voor een leerpad (Dwengo)
export async function getDwengoObjectsForPath(
  pathId: string,
  isTeacher: boolean,
): Promise<LearningObjectDto[]> {
  try {
    const pathResp = await dwengoAPI.get("/api/learningPath/search", {
      params: { all: "" },
    });
    const allPaths: any[] = pathResp.data;
    const learningPath = allPaths.find((lp) => lp._id === pathId);
    if (!learningPath) {
      console.warn(`Leerpad met _id=${pathId} niet gevonden in Dwengo-API.`);
      return [];
    }
    const nodes = learningPath.nodes || [];
    const results: LearningObjectDto[] = [];

    for (const node of nodes) {
      try {
        const params = {
          hruid: node.learningobject_hruid,
          version: node.version,
          language: node.language,
        };
        const response = await dwengoAPI.get(
          "/api/learningObject/getMetadata",
          { params },
        );
        const dwengoObj: DwengoLearningObject = response.data;
        const mapped = mapDwengoToLocal(dwengoObj);

        if (!isTeacher && (mapped.teacherExclusive || !mapped.available)) {
          continue;
        }
        results.push(mapped);
      } catch (err) {
        console.error("Fout bij ophalen node:", err);
      }
    }
    return results;
  } catch (error) {
    console.error("Fout bij getDwengoObjectsForPath:", error);
    return [];
  }
}
