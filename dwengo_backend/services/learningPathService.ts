import { dwengoAPI } from "../config/dwengoAPI";
import { throwCorrectNetworkError } from "../errors/errorFunctions";
import { NotFoundError } from "../errors/errors";

export interface LearningPathDto {
  _id: string; // Dwengo gebruikt _id of in onze DB is het id
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
  filters: {
    language?: string;
    hruid?: string;
    title?: string;
    description?: string;
    all?: string; // leeg string => alles
  } = {}
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

    // GET call
    const response = await dwengoAPI.get("/api/learningPath/search", {
      params,
    });

    if (!Array.isArray(response.data)) {
      throw new NotFoundError(
        `Dwengo learning path with specified filters not found.`
      );
    }

    const dwengoData = response.data; // array van leerpaden

    // Map elk item naar LearningPathDto
    return dwengoData.map(mapDwengoPathToLocal);
  } catch (error) {
    throwCorrectNetworkError(
      error as Error,
      "Something went wrong when communicating with the Dwengo API."
    );
  }
  // Dit zou nooit mogen gebeuren
  return [];
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
): Promise<LearningPathDto> {
  try {
    // Dwengo heeft geen echte "getById", we doen search + filteren
    const params = { all: "" };
    const response = await dwengoAPI.get("/api/learningPath/search", {
      params,
    });

    if (!Array.isArray(response.data)) {
      throw new NotFoundError("Dwengo learning paths not found.");
    }

    const allPaths = response.data;

    // Zoeken in array op basis van _id of hruid
    const found = allPaths.find(
      (lp: any) => lp._id === idOrHruid || lp.hruid === idOrHruid
    );
    if (!found) {
      throw new NotFoundError(
        `Learning path with id/hruid "${idOrHruid}" not found.`
      );
    }

    // map + isExternal = true
    return mapDwengoPathToLocal(found);
  } catch (error) {
    throwCorrectNetworkError(
      error as Error,
      "Something went wrong when communicating with the Dwengo API."
    );
  }
  // Dit zou nooit mogen gebeuren
  return {} as LearningPathDto;
}
