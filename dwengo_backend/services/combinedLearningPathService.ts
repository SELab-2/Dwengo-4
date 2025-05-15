import { NotFoundError } from "../errors/errors";
import {
  getLearningPathByIdOrHruid as getDwengoPathByIdOrHruid,
  LearningPathDto,
  searchLearningPaths as dwengoSearchPaths,
} from "./learningPathService";
import localLearningPathService from "./localLearningPathService";

interface CombinedLearningPathFilters {
  language?: string;
  hruid?: string;
  title?: string;
  description?: string;
  all?: string;
}

/**
 * Zoekt leerpaden (Dwengo + lokaal).
 */
export async function searchAllLearningPaths(
  filters: CombinedLearningPathFilters = {},
): Promise<LearningPathDto[]> {
  // A) Dwengo
  const dwengoResults = await dwengoSearchPaths(filters); // isExternal = true

  // B) Lokaal
  const localResults = await localLearningPathService.searchLocalPaths(filters); // isExternal = false

  // C) Combineer en return
  return [...dwengoResults, ...localResults];
}

/**
 * Haalt 1 leerpad op (via ID/hruid).
 * Probeer eerst in Dwengo; als niet gevonden, haal lokaal op,
 * eventueel inclusief voortgang voor een specifieke student.
 */
export async function getCombinedLearningPathByIdOrHruid(
  idOrHruid: string,
  includeProgress: boolean = false,
  studentId?: number,
): Promise<LearningPathDto> {
  try {
    // 1) Probeer in Dwengo (Dwengo ondersteunt geen progress)
    return await getDwengoPathByIdOrHruid(idOrHruid);
  } catch (error) {
    if (error instanceof NotFoundError) {
      // Dwengo path niet gevonden → haalt lokaal op, met of zonder progress
      return await localLearningPathService.getLearningPathAsDtoByIdOrHruid(
        idOrHruid,
        includeProgress,
        studentId,
      );
    }
    throw error;
  }
}
