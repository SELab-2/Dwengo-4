import { dwengoAPI } from "../config/dwengoAPI";
import {
  assertArrayDwengoLearningPath,
  throwCorrectNetworkError,
} from "../errors/errorFunctions";
import { NotFoundError } from "../errors/errors";


export interface LearningPathTransition {
  nodeId:     string;
  nextNodeId: string | null;
  default:    boolean;
  condition?: string | null;
}

export interface LearningPathDto {
  id: string; // Dwengo gebruikt _id of in onze DB is het id
  hruid: string;
  language: string;
  title: string;
  description: string;
  image?: string;
  num_nodes?: number;
  num_nodes_left: number;
  // properderr dan die any
  nodes: Array<{
    nodeId: string;
    isExternal: boolean;
    localLearningObjectId?: string;
    dwengoHruid?: string;
    done: boolean;
  }>;

  createdAt?: string;
  updatedAt?: string;
  creator?: {
    id: number;
    firstName: string;
    lastName: string;
  }; // for local paths

  // ===== BELANGRIJK =====
  // Zodat we Dwengo vs. lokaal kunnen onderscheiden in 1 type:
  isExternal: boolean;
}

// Dwengo -> Local mapping
function mapDwengoPathToLocal(dwengoPath: any): LearningPathDto {
  return {
    id: dwengoPath._id ?? "",
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
    creator: undefined, // dwengo paths don't have a specific creator
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
    all?: string;
  } = {},
): Promise<LearningPathDto[]> {
  const params: Record<string, any> = {};
  if (filters.language) params.language = filters.language;
  if (filters.hruid) params.hruid = filters.hruid;
  if (filters.title) params.title = filters.title;
  if (filters.description) params.description = filters.description;
  if (filters.all !== undefined) {
    params.all = filters.all;
  }

  try {
    const response = await dwengoAPI.get("/api/learningPath/search", {
      params,
    });

    const data = await assertArrayDwengoLearningPath(
      async () => response.data,
      `Dwengo learning path with specified filters not found.`,
    );

    return data.map(mapDwengoPathToLocal);
  } catch (error) {
    throwCorrectNetworkError(
      error as Error,
      "Something went wrong when communicating with the Dwengo API.",
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
  idOrHruid: string,
): Promise<LearningPathDto> {
  try {
    // Dwengo heeft geen echte "getById", we searchen en filteren
    const params = { all: "" };

    const response = await assertArrayDwengoLearningPath(
      async () =>
        (
          await dwengoAPI.get("/api/learningPath/search", {
            params,
          })
        ).data,
      `Dwengo learning path with id/hruid "${idOrHruid}" not found.`,
    );

    // Zoeken in array op basis van _id of hruid
    const found = findOrThrow(
      response,
      (lp: any) => lp._id === idOrHruid || lp.hruid === idOrHruid,
      `Learning path with id/hruid "${idOrHruid}" not found.`,
    );

    // map + isExternal = true
    return mapDwengoPathToLocal(found);
  } catch (error) {
    throwCorrectNetworkError(
      error as Error,
      "Something went wrong when communicating with the Dwengo API.",
    );
  }
  // Dit zou nooit mogen gebeuren
  return {} as LearningPathDto;
}

export function findOrThrow<T>(
  array: T[] | null | undefined,
  predicate: (_: T) => boolean,
  errorMessage: string,
): T {
  if (!Array.isArray(array)) {
    throw new NotFoundError(errorMessage);
  }

  const found = array.find(predicate);
  if (!found) {
    throw new NotFoundError(errorMessage);
  }

  return found;
}
