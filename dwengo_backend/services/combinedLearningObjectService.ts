/**
 * combinedLearningObjectService.ts
 * Logica die Dwengo + lokale DB combineert.
 */

import {
    fetchAllDwengoObjects,
    fetchDwengoObjectById,
    searchDwengoObjects,
    getDwengoObjectsForPath,
    LearningObjectDto, // import hier gebruiken
  } from "./dwengoLearningObjectService";
  import {
    getLocalLearningObjects,
    getLocalLearningObjectById,
    searchLocalLearningObjects,
  } from "./localDBLearningObjectService";
  
/**
 * Haalt ALLE leerobjecten op: Dwengo + lokaal.
 */
export async function getAllLearningObjects(
  isTeacher: boolean
): Promise<LearningObjectDto[]> {
  const dwengoObjs = await fetchAllDwengoObjects(isTeacher);
  const localObjs = await getLocalLearningObjects(isTeacher);
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
 * Haal 1 leerobject op: eerst Dwengo check, zo niet, dan local.
 */
export async function getLearningObjectById(
  id: string,
  isTeacher: boolean
): Promise<LearningObjectDto | null> {
  const fromDwengo = await fetchDwengoObjectById(id, isTeacher);
  if (fromDwengo) return fromDwengo;

  const fromLocal = await getLocalLearningObjectById(id, isTeacher);
  if (fromLocal) return fromLocal;

  return null;
}

/**
 * Haalt alle leerobjecten op die bij een leerpad (Dwengo) horen.
 * Wil je later ook lokale leerpaden toevoegen, pas deze functie aan.
 */
export async function getLearningObjectsForPath(
  pathId: string,
  isTeacher: boolean
): Promise<LearningObjectDto[]> {
  return await getDwengoObjectsForPath(pathId, isTeacher);
}
