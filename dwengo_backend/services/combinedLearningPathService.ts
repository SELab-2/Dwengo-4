
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
    } = {}
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
    idOrHruid: string
  ): Promise<LearningPathDto | null> {
    // 1) Dwengo
    const dwengo = await getDwengoPathByIdOrHruid(idOrHruid);
    if (dwengo) return dwengo;
  
    // 2) Lokaal
    const local = await localLearningPathService.getLearningPathAsDtoByIdOrHruid(
      idOrHruid
    );
    if (local) return local;
  
    return null;
  }
  