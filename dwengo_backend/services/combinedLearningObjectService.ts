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
  isTeacher: boolean
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
  searchTerm: string
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
  isTeacher: boolean
): Promise<LearningObjectDto> {
  // Eerst Dwengo checken
  // Deze functie zal een NotFoundError gooien als het object niet bestaat
  // Anders zal het object teruggegeven worden
  try {
    return await fetchDwengoObjectById(id, isTeacher);
  } catch (error) {
    if (error instanceof NotFoundError) {
      // Dwengo-object niet gevonden, ga verder met lokaal
      // Deze functie zal ook een error opgooien als het object niet gevonden wordt of als er andere fouten zijn
      // Dit zal dan door de error middleware opgevangen worden
      return await getLocalLearningObjectById(id, isTeacher);
    }
    // Rethrow de error als het geen NotFoundError is
    throw error;
  }
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

// [NIEUW] Haal 1 leerobject op via hruid-language-version
export async function getLearningObjectByHruidLangVersion(
  hruid: string,
  language: string,
  version: number,
  isTeacher: boolean
): Promise<LearningObjectDto> {
  // 1) Probeer Dwengo
  try {
    return await fetchDwengoObjectByHruidLangVersion(
      hruid,
      language,
      version,
      isTeacher
    );
  } catch (error) {
    if (error instanceof NotFoundError) {
      // Dwengo-object niet gevonden, ga verder met lokaal
      // 2) Probeer lokaal
      return await getLocalLearningObjectByHruidLangVersion(
        hruid,
        language,
        version,
        isTeacher
      );
    }
    // Rethrow de error als het geen NotFoundError is
    // Laat de error middleware dit afhandelen
    throw error;
  }
}
