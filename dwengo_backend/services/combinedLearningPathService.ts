import { NotFoundError } from "../errors/errors";
import {
  searchLearningPaths as dwengoSearchPaths,
  getLearningPathByIdOrHruid as getDwengoPathByIdOrHruid,
  LearningPathDto,
} from "./learningPathService";

import localLearningPathService from "./localLearningPathService";

export async function searchAllLearningPaths(
  filters: {
    language?: string;
    hruid?: string;
    title?: string;
    description?: string;
    all?: string;
  } = {},
): Promise<LearningPathDto[]> {
  // A) Dwengo
  const dwengoResults = await dwengoSearchPaths(filters); // => isExternal=true

  // B) Lokaal
  const localResults = await localLearningPathService.searchLocalPaths(filters); // => isExternal=false

  // C) Combineer en return
  return [...dwengoResults, ...localResults];
}

/**
 * Haal 1 leerpad op (via ID/hruid) => Dwengo => zoniet => Lokaal
 */
export async function getCombinedLearningPathByIdOrHruid(
  idOrHruid: string,
): Promise<LearningPathDto> {
  try {
    // 1) Dwengo
    return await getDwengoPathByIdOrHruid(idOrHruid);
  } catch (error) {
    if (error instanceof NotFoundError) {
      // Dwengo leerpad niet gevonden in de Dwengo API
      // Ga verder met lokaal
      return await localLearningPathService.getLearningPathAsDtoByIdOrHruid(
        idOrHruid,
      );
    }
    throw error;
  }
}
