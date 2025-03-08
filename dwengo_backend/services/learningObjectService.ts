import { dwengoAPI } from "../config/dwengoAPI";
import { LearningObject, PrismaClient } from "@prisma/client";

// ============= [ Types voor Dwengo vs Local ] ============= //

enum ContentType {
  TEXT_PLAIN = "text/plain",
  TEXT_MARKDOWN = "text/markdown",
  IMAGE_IMAGE_BLOCK = "image/image-block",
  IMAGE_IMAGE = "image/image",
  AUDIO_MPEG = "audio/mpeg",
  VIDEO = "video",
  EVAL_MULTIPLE_CHOICE = "evaluation/multiple-choice",
  EVAL_OPEN_QUESTION = "evaluation/open-question",
}

const permittedContentTypes = {
  "text/plain": ContentType.TEXT_PLAIN,
  "text/markdown": ContentType.TEXT_MARKDOWN,
  "image/image-block": ContentType.IMAGE_IMAGE_BLOCK,
  "image/image": ContentType.IMAGE_IMAGE,
  "audio/mpeg": ContentType.AUDIO_MPEG,
  video: ContentType.VIDEO,
  "evaluation/multiple-choice": ContentType.EVAL_MULTIPLE_CHOICE,
  "evaluation/open-question": ContentType.EVAL_OPEN_QUESTION,
};

export interface LearningObjectDto {
  // Gebruiken we als "universeel" DTO voor de frontend
  // of controllers (Dwengo + Local)
  id: string; // _id (Dwengo) of UUID (Local)
  uuid: string;
  hruid: string;
  version: number;
  language: string;
  title: string;
  description: string;
  contentType: string;
  keywords: Array<string>;
  targetAges: Array<number>;
  teacherExclusive: boolean;
  skosConcepts: Array<string>;
  copyright: string;
  licence: string;
  difficulty: number;
  estimatedTime: number;
  available: boolean;
  contentLocation?: string;
  createdAt: string;
  updatedAt: string;
  // We kunnen een extra "origin" toevoegen om te weten of het van Dwengo of local komt
  origin: "dwengo" | "local";
}

// Dit type wordt gebruikt voor de Dwengo-API
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

// ============= [ Prisma init ] ============= //
const prisma = new PrismaClient();

// ============= [ Helper: Dwengo => Local DTO ] ============= //
function mapDwengoToLocal(dwengoObj: DwengoLearningObject): LearningObjectDto {
  return {
    id: dwengoObj._id ?? "",
    uuid: dwengoObj.uuid ?? "",
    hruid: dwengoObj.hruid ?? "",
    version: dwengoObj.version ?? 1,
    language: dwengoObj.language ?? "",
    title: dwengoObj.title ?? "",
    description: dwengoObj.description ?? "",
    // Check of content_type een bekende ContentType is, anders TEXT_PLAIN
    contentType:
      permittedContentTypes[
        (dwengoObj.content_type as keyof typeof permittedContentTypes) ?? ""
      ] ?? ContentType.TEXT_PLAIN,
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

// ============= [ DWENGO-FUNCTIES (ongewijzigd behalve naam) ] ============= //
async function fetchAllDwengoObjects(
  isTeacher: boolean
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

async function fetchDwengoObjectById(
  id: string,
  isTeacher: boolean
): Promise<LearningObjectDto | null> {
  try {
    // Dwengo herkent ID via _id param
    const params = { _id: id };
    const response = await dwengoAPI.get("/api/learningObject/getMetadata", {
      params,
    });
    const dwengoObj: DwengoLearningObject = response.data;
    const mapped = mapDwengoToLocal(dwengoObj);

    if (!isTeacher && (mapped.teacherExclusive || !mapped.available)) {
      return null; // student geen toegang
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

async function searchDwengoObjects(
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

// ============= [ LOKALE-FUNCTIES (NEW) ] ============= //

// Helper om Prisma-object => LearningObjectDto te mappen
function mapLocalToDto(
  localObj: LearningObject,
  isTeacher: boolean
): LearningObjectDto {
  return {
    id: localObj.id,
    uuid: localObj.uuid,
    hruid: localObj.hruid, // kan ook nog localObj.title worden
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
 * Haal alle lokale leerobjecten op.
 * Filter voor studenten: enkel teacherExclusive=false en available=true.
 */
async function getLocalLearningObjects(
  isTeacher: boolean
): Promise<LearningObjectDto[]> {
  const whereClause = isTeacher
    ? {} // Als teacher: geen beperkingen
    : { teacherExclusive: false, available: true };

  const localObjects = await prisma.learningObject.findMany({
    where: whereClause,
    orderBy: { createdAt: "desc" },
  });

  return localObjects.map((obj) => mapLocalToDto(obj, isTeacher));
}

/**
 * Haal 1 lokaal leerobject op (check of student dit mag zien).
 */
async function getLocalLearningObjectById(
  id: string,
  isTeacher: boolean
): Promise<LearningObjectDto | null> {
  const localObj = await prisma.learningObject.findUnique({
    where: { id },
  });
  if (!localObj) return null;

  // Als user geen teacher is, check of object teacherExclusive=false en available=true
  if (!isTeacher && (localObj.teacherExclusive || !localObj.available)) {
    return null;
  }

  return mapLocalToDto(localObj, isTeacher);
}

/**
 * Doorzoeken van de lokale DB op basis van 'searchTerm' in de title/description/keywords, etc.
 * (Simpel voorbeeld: we filteren in de DB op title & description.)
 */
async function searchLocalLearningObjects(
  isTeacher: boolean,
  searchTerm: string
): Promise<LearningObjectDto[]> {
  const whereClause: any = {
    OR: [
      { title: { contains: searchTerm, mode: "insensitive" } },
      { description: { contains: searchTerm, mode: "insensitive" } },
      { keywords: { contains: searchTerm, mode: "insensitive" } },
    ],
  };

  if (!isTeacher) {
    // student => mag alleen teacherExclusive=false en available=true ZIEN
    whereClause.AND = [{ teacherExclusive: false }, { available: true }];
  }

  const localObjects = await prisma.learningObject.findMany({
    where: whereClause,
    orderBy: { createdAt: "desc" },
  });

  return localObjects.map((obj) => mapLocalToDto(obj, isTeacher));
}

// ============= [ COMBINERENDE FUNCTIES VOOR DE CONTROLLER ] ============= //

/**
 * Haalt ALLE leerobjecten op: Dwengo + lokaal.
 */
export async function getAllLearningObjects(
  isTeacher: boolean
): Promise<LearningObjectDto[]> {
  // 1) Dwengo
  const dwengoObjs = await fetchAllDwengoObjects(isTeacher);
  // 2) Lokaal
  const localObjs = await getLocalLearningObjects(isTeacher);
  // 3) Combineer en retourneer (eventueel sorteren of fusioneren)
  return [...dwengoObjs, ...localObjs];
}

/**
 * Zoeken (Dwengo + Lokaal)
 */
export async function searchLearningObjects(
  isTeacher: boolean,
  searchTerm: string
): Promise<LearningObjectDto[]> {
  const dwengoResults = await searchDwengoObjects(isTeacher, searchTerm);
  const localResults = await searchLocalLearningObjects(isTeacher, searchTerm);
  return [...dwengoResults, ...localResults];
}

/**
 * Haal 1 leerobject op: eerst checken bij Dwengo, zo niet gevonden => check local DB.
 */
export async function getLearningObjectById(
  id: string,
  isTeacher: boolean
): Promise<LearningObjectDto | null> {
  // 1) Dwengo
  const fromDwengo = await fetchDwengoObjectById(id, isTeacher);
  if (fromDwengo) return fromDwengo;

  // 2) Local
  const fromLocal = await getLocalLearningObjectById(id, isTeacher);
  if (fromLocal) return fromLocal;

  // 3) Niet gevonden
  return null;
}

/**
 * Haalt alle leerobjecten op die bij een leerpad (Dwengo) horen (ongewijzigd).
 * (Mocht je ook "lokale" leerpaden willen ondersteunen, voeg je eigen logica toe.)
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
        // Ophalen van metadata via Dwengo
        // Dit is pure Dwengo-logica:
        const params = {
          hruid: node.learningobject_hruid,
          version: node.version,
          language: node.language,
        };
        const response = await dwengoAPI.get(
          "/api/learningObject/getMetadata",
          { params }
        );
        const dwengoObj: DwengoLearningObject = response.data;
        const mapped = mapDwengoToLocal(dwengoObj);

        // filter teacherExclusive if not teacher
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
    console.error("Fout bij getLearningObjectsForPath:", error);
    return [];
  }
}
