import {dwengoAPI} from "../config/dwengoAPI";

export interface LearningPathDto {
  _id: string; // Dwengo gebruikt _id
  hruid: string; // Human readable unique id
  language: string;
  title: string;
  description: string;
  image?: string;
  num_nodes?: number; // Aantal nodes in het pad
  num_nodes_left: number;
  nodes: any[]; // Array van nodes (zie Dwengo docs), elk met transitions, etc.
  createdAt?: string; // Als Dwengo 'created_at' meegeeft
  updatedAt?: string; // Als Dwengo 'updatedAt' meegeeft
}

/**
 * Hulpfunctie om JSON van Dwengo te mappen naar een LearningPathDto
 */
function mapDwengoPathToLocal(dwengoPath: any): LearningPathDto {
  return {
    _id: dwengoPath._id ?? "",
    hruid: dwengoPath.hruid ?? "",
    language: dwengoPath.language ?? "",
    title: dwengoPath.title ?? "",
    description: dwengoPath.description ?? "",
    image: dwengoPath.image ?? "",
    num_nodes: dwengoPath.num_nodes ?? 0,
    num_nodes_left: dwengoPath.num_nodes_left ?? 0,
    nodes: dwengoPath.nodes ?? [],
    createdAt: dwengoPath.created_at ?? "",
    updatedAt: dwengoPath.updatedAt ?? "",
  };
}

/**
 * Haalt alle leerpaden op via Dwengo API: /api/learningPath/search
 * - Je kunt filteren met all, language, title, description, hruid, ...
 *   (zie Dwengo docs)
 * @param filters Object met mogelijke zoekfilters
 */
export async function searchLearningPaths(
  filters: {
    language?: string;
    hruid?: string;
    title?: string;
    description?: string;
    all?: string; // leeg string => alles
  } = {}
): Promise<LearningPathDto[]> {
  try {
    // Zet de filters om naar Dwengo queryparams
    const params: Record<string, any> = {};

    // Dwengo-API ondersteunt: all, language, hruid, title, description
    // (zie docs: <dwengo-host>/api/learningPath/search?all=&language=nl&hruid=... etc.)
    if (filters.language) params.language = filters.language;
    if (filters.hruid) params.hruid = filters.hruid;
    if (filters.title) params.title = filters.title;
    if (filters.description) params.description = filters.description;

    // 'all=' => om alle paden op te halen
    if (filters.all !== undefined) {
      // Bijv. filters.all = "" → ?all=
      params.all = filters.all;
    }

    // GET call
    const response = await dwengoAPI.get("/api/learningPath/search", {
      params,
    });
    const dwengoData = response.data; // array van leerpaden

    // Map elk item naar LearningPathDto
    return dwengoData.map(mapDwengoPathToLocal);
  } catch (error) {
    console.error("Fout bij searchLearningPaths:", error);
    throw new Error("Dwengo API call voor leerpaden mislukt.");
  }
}

/**
 * Haalt 1 leerpad op (niet voorzien in Dwengo met /getMetadata,
 * maar je kunt filteren in search op bijv. hruid of _id).
 *
 * Let op: Dwengo heeft geen dedicated "getLearningPathById" route;
 * je zoekt typically via search + hruid=... of all=...
 */
export async function getLearningPathByIdOrHruid(
  idOrHruid: string
): Promise<LearningPathDto | null> {
  try {
    // Probeer te zoeken met hruid=... of als je _id hebt, moet je 'all=' gebruiken en local filteren
    const params = { all: "" };
    const response = await dwengoAPI.get("/api/learningPath/search", {
      params,
    });
    const allPaths = response.data;

    // Zoeken in array op basis van _id of hruid
    const found = allPaths.find(
      (lp: any) => lp._id === idOrHruid || lp.hruid === idOrHruid
    );
    if (!found) return null;

    return mapDwengoPathToLocal(found);
  } catch (error) {
    console.error("Fout bij getLearningPathByIdOrHruid:", error);
    return null;
  }
}
