
import { dwengoAPI } from "../config/dwengoAPI";

export interface LearningPathDto {
  _id: string;      // Dwengo gebruikt _id of in onze DB is het id
  hruid: string;
  language: string;
  title: string;
  description: string;
  image?: string;
  num_nodes?: number;
  num_nodes_left: number;
  nodes: any[];
  createdAt?: string;
  updatedAt?: string;

  // ===== BELANGRIJK =====
  // Zodat we Dwengo vs. lokaal kunnen onderscheiden in 1 type:
  isExternal: boolean; 
}

// Dwengo -> Local mapping
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
    // Nieuw: Dwengo => altijd true
    isExternal: true,
  };
}

/**
 * De exports om naar Dwengo te zoeken en op te halen.
 * (ongewijzigd, behalve dat mapDwengoPathToLocal nu isExternal=true zet)
 */
export async function searchLearningPaths(
  filters: { language?: string; hruid?: string; title?: string; description?: string; all?: string } = {}
): Promise<LearningPathDto[]> {
  try {
    const params: Record<string, any> = {};
    if (filters.language) params.language = filters.language;
    if (filters.hruid) params.hruid = filters.hruid;
    if (filters.title) params.title = filters.title;
    if (filters.description) params.description = filters.description;
    if (filters.all !== undefined) {
      params.all = filters.all;
    }

    const response = await dwengoAPI.get("/api/learningPath/search", { params });
    const dwengoData = response.data; // array van leerpaden

    const results = dwengoData.map(mapDwengoPathToLocal);
    return results;
  } catch (error) {
    console.error("Fout bij searchLearningPaths:", error);
    throw new Error("Dwengo API call voor leerpaden mislukt.");
  }
}

export async function getLearningPathByIdOrHruid(
  idOrHruid: string
): Promise<LearningPathDto | null> {
  try {
    // Dwengo heeft geen echte "getById", we doen search + filteren
    const params = { all: "" };
    const response = await dwengoAPI.get("/api/learningPath/search", {
      params,
    });
    const allPaths = response.data; // array

    // Zoeken in array op basis van _id of hruid
    const found = allPaths.find((lp: any) => lp._id === idOrHruid || lp.hruid === idOrHruid);
    if (!found) return null;

    // map + isExternal = true
    return mapDwengoPathToLocal(found);
  } catch (error) {
    console.error("Fout bij getLearningPathByIdOrHruid:", error);
    return null;
  }
}
