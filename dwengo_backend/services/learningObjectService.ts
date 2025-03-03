
import { dwengoAPI } from "../config/dwengoAPI";

// Dit is een interface die overeenkomt met de velden in jullie lokale Prisma-schema
// voor LearningObject. We mappen de Dwengo-API velden naar deze interface.
export interface LearningObjectDto {
  id: string;                  // Map naar _id of uuid
  version: string;             // Dwengo: version (int of string), lokaal is het string
  language: string;
  title: string;
  description: string;
  contentType: string;         // Dwengo: content_type
  keywords: string;            // Dwengo: array of string => hier samengevoegd
  targetAges: string;          // Dwengo: array of number => hier samengevoegd als string
  teacherExclusive: boolean;   // Dwengo: teacher_exclusive
  skosConcepts: string;        // Dwengo: array of string => hier samengevoegd
  copyright?: string;
  licence: string;
  difficulty: number;
  estimatedTime: number;
  available: boolean;
  contentLocation: string;
  createdAt: string;           // Dwengo: created_at
  updatedAt: string;           // Dwengo: updatedAt
}

/**
 * Helperfunctie om de Dwengo API-respons (met velden als _id, teacher_exclusive, etc.)
 * te mappen naar ons lokale LearningObjectDto formaat.
 */
function mapDwengoToLocal(dwengoObj: any): LearningObjectDto {
  return {
    // Probeer eerst _id (dwengo) of uuid. Als beiden ontbreken, vult hij een lege string in.
    id: dwengoObj._id ?? dwengoObj.uuid ?? "",

    // Dwengo gebruikt soms int of string voor version, wij forceren string
    version: dwengoObj.version ? dwengoObj.version.toString() : "",

    language: dwengoObj.language ?? "",
    title: dwengoObj.title ?? "",
    description: dwengoObj.description ?? "",

    // Dwengo gebruikt content_type, lokale schema contentType
    contentType: dwengoObj.content_type ?? "",

    // Dwengo keywords is array<string>, we plakken het hier samen in één string
    keywords: dwengoObj.keywords ? dwengoObj.keywords.join(", ") : "",

    // Dwengo target_ages is array<number>, samenvoegen tot "14,15,16" etc.
    targetAges: dwengoObj.target_ages ? dwengoObj.target_ages.join(",") : "",

    // teacher_exclusive -> teacherExclusive
    teacherExclusive: Boolean(dwengoObj.teacher_exclusive),

    // Dwengo skos_concepts is array<string>, samengevoegd tot één string
    skosConcepts: dwengoObj.skos_concepts ? dwengoObj.skos_concepts.join(", ") : "",

    copyright: dwengoObj.copyright ?? "",
    licence: dwengoObj.licence ?? "",
    difficulty: dwengoObj.difficulty ?? 0,
    estimatedTime: dwengoObj.estimated_time ?? 0,

    // Dwengo: available
    available: dwengoObj.available ?? false,

    // Dwengo: content_location => contentLocation
    contentLocation: dwengoObj.content_location ?? "",

    // Dwengo: created_at en updatedAt
    createdAt: dwengoObj.created_at ?? "",
    updatedAt: dwengoObj.updatedAt ?? "",
  };
}

/**
 * Haal alle leerobjecten op via de Dwengo-API. Filter op teacherExclusive/available
 * indien de gebruiker geen teacher of admin is.
 */
export async function getAllLearningObjects(isTeacher: boolean): Promise<LearningObjectDto[]> {
  try {
    const params: Record<string, any> = {};
    if (!isTeacher) {
      // Filter op niet-teacherExcl & available
      params.teacher_exclusive = false;
      params.available = true;
    }

    const response = await dwengoAPI.get("/api/learningObject/search", { params });
    const dwengoData = response.data; // array van leerobjecten
    const mapped = dwengoData.map(mapDwengoToLocal);

    return mapped;
  } catch (error) {
    console.error("Fout bij getAllLearningObjects:", error);
    throw new Error("Dwengo API call mislukt.");
  }
}

/**
 * Haal één leerobject op (via Dwengo /getMetadata), op basis van _id
 */
export async function getLearningObjectById(id: string, isTeacher: boolean): Promise<LearningObjectDto | null> {
  try {
    // Dwengo interpreteert _id als "id" in de queryparam
    const params = { _id: id };
    const response = await dwengoAPI.get("/api/learningObject/getMetadata", { params });

    const dwengoObj = response.data;
    const mapped = mapDwengoToLocal(dwengoObj);

    // Check op exclusiviteit
    if (!isTeacher && (mapped.teacherExclusive || !mapped.available)) {
      return null;
    }
    return mapped;
  } catch (error: any) {
    // Als Dwengo 404 teruggeeft, geven we null
    if (error.response && error.response.status === 404) {
      return null;
    }
    console.error("Fout bij getLearningObjectById:", error);
    return null;
  }
}

/**
 * Zoeken naar leerobjecten via Dwengo ( /search ), met bv. ?q=blabla
 */
export async function searchLearningObjects(isTeacher: boolean, searchTerm: string): Promise<LearningObjectDto[]> {
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
    const dwengoData = response.data;
    const mapped = dwengoData.map(mapDwengoToLocal);
    return mapped;
  } catch (error) {
    console.error("Fout bij searchLearningObjects:", error);
    throw new Error("Dwengo API search mislukt.");
  }
}

/**
 * Haal leerobjecten op voor een gegeven leerpad (via Dwengo /api/learningPath/search).
 * Let op: Dwengo gebruikt `_id` (of `hruid`) om het leerpad te identificeren.
 * => We zoeken in het array van zoekresultaten naar `lp._id === pathId`.
 */
export async function getLearningObjectsForPath(pathId: string, isTeacher: boolean): Promise<LearningObjectDto[]> {
  try {
    // 1) Haal alle leerpaden op via Dwengo
    const pathResp = await dwengoAPI.get("/api/learningPath/search", { params: { all: "" } });
    const allPaths = pathResp.data; // array van leerpaden

    // 2) Vind het leerpad dat past bij pathId. Dwengo gebruikt meestal `_id`.
    //    Als je in jouw data `hruid` wilt gebruiken, vervang je _id door hruid
    const learningPath = allPaths.find((lp: any) => lp._id === pathId);
    if (!learningPath) {
      console.warn(`Leerpad met _id=${pathId} niet gevonden in Dwengo-API.`);
      return [];
    }

    const nodes = learningPath.nodes || [];
    const results: LearningObjectDto[] = [];

    // 3) Voor elke node: haal het leerobject op via getMetadata
    for (const node of nodes) {
      try {
        const lo = await fetchMetadataForNode(node);
        if (!lo) continue;

        // Filter op exclusiviteit
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

/**
 * Hulpfunctie om 1 node te mappen naar getMetadata.
 * Dwengo: we gebruiken hruid, version, language om het leerobject op te vragen.
 * Eventueel checken we ook of node._id bestaat.
 */
async function fetchMetadataForNode(node: any): Promise<LearningObjectDto | null> {
  const params = {
    hruid: node.learningobject_hruid,
    version: node.version,
    language: node.language,
  };
  const response = await dwengoAPI.get("/api/learningObject/getMetadata", { params });
  const dwengoObj = response.data;
  return mapDwengoToLocal(dwengoObj);
}
