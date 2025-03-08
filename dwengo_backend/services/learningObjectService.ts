import { dwengoAPI } from "../config/dwengoAPI";

export interface LearningObjectDto {
  id: string;
  version: string;
  language: string;
  title: string;
  description: string;
  contentType: string;
  keywords: string;
  targetAges: string;
  teacherExclusive: boolean;
  skosConcepts: string;
  copyright?: string;
  licence: string;
  difficulty: number;
  estimatedTime: number;
  available: boolean;
  contentLocation: string;
  createdAt: string;
  updatedAt: string;
}

interface DwengoLearningObject {
  _id?: string;
  uuid?: string;
  version?: number | string;
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

/**
 * Helperfunctie om een DwengoLearningObject te mappen naar ons lokale LearningObjectDto.
 */
function mapDwengoToLocal(dwengoObj: DwengoLearningObject): LearningObjectDto {
  return {
    id: dwengoObj._id ?? dwengoObj.uuid ?? "",
    version: dwengoObj.version ? dwengoObj.version.toString() : "",
    language: dwengoObj.language ?? "",
    title: dwengoObj.title ?? "",
    description: dwengoObj.description ?? "",
    contentType: dwengoObj.content_type ?? "",
    keywords: dwengoObj.keywords ? dwengoObj.keywords.join(", ") : "",
    targetAges: dwengoObj.target_ages ? dwengoObj.target_ages.join(",") : "",
    teacherExclusive: Boolean(dwengoObj.teacher_exclusive),
    skosConcepts: dwengoObj.skos_concepts ? dwengoObj.skos_concepts.join(", ") : "",
    copyright: dwengoObj.copyright ?? "",
    licence: dwengoObj.licence ?? "",
    difficulty: dwengoObj.difficulty ?? 0,
    estimatedTime: dwengoObj.estimated_time ?? 0,
    available: dwengoObj.available ?? false,
    contentLocation: dwengoObj.content_location ?? "",
    createdAt: dwengoObj.created_at ?? "",
    updatedAt: dwengoObj.updatedAt ?? "",
  };
}

/**
 * Haal alle leerobjecten op via de Dwengo-API.
 * Studenten zien enkel objecten met teacherExclusive = false en available = true.
 * Teachers/Admins zien alle objecten.
 */
export async function getAllLearningObjects(
  isTeacher: boolean
): Promise<LearningObjectDto[]> {
  try {
    const params: Record<string, any> = {};
    if (!isTeacher) {
      params.teacher_exclusive = false;
      params.available = true;
    }
    const response = await dwengoAPI.get("/api/learningObject/search", { params });
    const dwengoData: DwengoLearningObject[] = response.data;
    return dwengoData.map(mapDwengoToLocal);
  } catch (error) {
    console.error("Fout bij getAllLearningObjects:", error);
    throw new Error("Dwengo API call mislukt.");
  }
}

/**
 * Haal één leerobject op via Dwengo's /getMetadata, op basis van _id.
 * Als het object teacherExclusive is en de gebruiker geen teacher is, wordt null geretourneerd.
 */
export async function getLearningObjectById(
  id: string,
  isTeacher: boolean
): Promise<LearningObjectDto | null> {
  try {
    const params = { _id: id };
    const response = await dwengoAPI.get("/api/learningObject/getMetadata", { params });
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
    console.error("Fout bij getLearningObjectById:", error);
    return null;
  }
}

/**
 * Zoeken naar leerobjecten via Dwengo (/search) met een searchTerm.
 */
export async function searchLearningObjects(
  isTeacher: boolean,
  searchTerm: string
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
    const response = await dwengoAPI.get("/api/learningObject/search", { params });
    const dwengoData: DwengoLearningObject[] = response.data;
    return dwengoData.map(mapDwengoToLocal);
  } catch (error) {
    console.error("Fout bij searchLearningObjects:", error);
    throw new Error("Dwengo API search mislukt.");
  }
}

/**
 * Haal leerobjecten op voor een gegeven leerpad (pathId) via Dwengo.
 * We halen alle leerpaden op en zoeken het leerpad dat overeenkomt met pathId,
 * waarna we voor elke node het bijbehorende leerobject ophalen.
 */
export async function getLearningObjectsForPath(
  pathId: string,
  isTeacher: boolean
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
        const lo: LearningObjectDto | null = await fetchMetadataForNode(node);
        if (!lo) continue;
        if (!isTeacher && (lo.teacherExclusive || !lo.available)) {
          continue;
        }
        results.push(lo);
      } catch (err) {
        console.error("Fout bij ophalen node:", err);
      }
    }
    return results;
  } catch (error) {
    console.error("Fout bij getLearningObjectsForPath:", error);
    return [];
  }
}

async function fetchMetadataForNode(node: any): Promise<LearningObjectDto | null> {
  const params = {
    hruid: node.learningobject_hruid,
    version: node.version,
    language: node.language,
  };
  const response = await dwengoAPI.get("/api/learningObject/getMetadata", { params });
  const dwengoObj: DwengoLearningObject = response.data;
  return mapDwengoToLocal(dwengoObj);
}
