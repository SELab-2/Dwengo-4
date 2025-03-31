import { throwCorrectNetworkError } from "../errors/errorFunctions";
import { NotFoundError } from "../errors/errors";
import {
  fetchAllDwengoObjects,
  fetchDwengoObjectById,
  searchDwengoObjects,
  getDwengoObjectsForPath,
  LearningObjectDto,
  // [NIEUW] importeer de functie om Dwengo-LO op te halen via hruid/lang/version
  fetchDwengoObjectByHruidLangVersion,
} from "./dwengoLearningObjectService";
import {
  getLocalLearningObjects,
  getLocalLearningObjectById,
  searchLocalLearningObjects,
  // [NIEUW] importeer de functie om lokaal LO op te halen via hruid/lang/version
  getLocalLearningObjectByHruidLangVersion,
} from "./localDBLearningObjectService";

/**
 * Haalt ALLE leerobjecten op: Dwengo + lokaal.
 */
export async function getAllLearningObjects(
  isTeacher: boolean,
): Promise<LearningObjectDto[]> {
  const dwengoObjs = await fetchAllDwengoObjects(isTeacher);
  const localObjs = await getLocalLearningObjects(isTeacher);
  return [...dwengoObjs, ...localObjs];
}

/**
 * Zoeken (Dwengo + lokaal)
 */
export async function searchLearningObjects(
  isTeacher: boolean,
  searchTerm: string,
): Promise<LearningObjectDto[]> {
  const dwengoResults = await searchDwengoObjects(isTeacher, searchTerm);
  const localResults = await searchLocalLearningObjects(isTeacher, searchTerm);
  return [...dwengoResults, ...localResults];
}

/**
 * Haal 1 leerobject op (op basis van 'id' – Dwengo _id of local ID).
 */
export async function getLearningObjectById(
  id: string,
  isTeacher: boolean,
): Promise<LearningObjectDto | null> {
  // Eerst Dwengo checken
  const fromDwengo = await fetchDwengoObjectById(id, isTeacher);
  if (fromDwengo) return fromDwengo;

  // Anders lokaal checken
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
  isTeacher: boolean,
): Promise<LearningObjectDto[]> {
  return await getDwengoObjectsForPath(pathId, isTeacher);
}

// [NIEUW] Haal 1 leerobject op via hruid-language-version
export async function getLearningObjectByHruidLangVersion(
  hruid: string,
  language: string,
  version: number,
  isTeacher: boolean,
): Promise<LearningObjectDto> {
  // 1) Probeer Dwengo
  try {
    return await fetchDwengoObjectByHruidLangVersion(
      hruid,
      language,
      version,
      isTeacher,
    );
  } catch (error) {
    if (error instanceof NotFoundError) {
      // Dwengo-object niet gevonden, ga verder met lokaal
      // 2) Probeer lokaal
      return await getLocalLearningObjectByHruidLangVersion(
        hruid,
        language,
        version,
        isTeacher,
      );
    } else {
      // Laat error middleware dit afhandelen
      throwCorrectNetworkError(
        error as Error,
        "Could not fetch learning object from Dwengo API.",
      );
    }
  }
  // Dit zou nooit mogen gebeuren
  throw new Error();
}
