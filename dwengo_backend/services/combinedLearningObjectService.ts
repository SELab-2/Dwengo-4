import { NotFoundError } from "../errors/errors";
import {
  fetchAllDwengoObjects,
  searchDwengoObjects,
  getLearningObjectsForDwengoPath,
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
  getLearningObjectsForLocalPath,
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
): Promise<LearningObjectDto> {
  // the dwengo API doesn't implement this correctly
  // so comment out code, and just search local objects
  // if the dwengo API is fixed in the future, this code can be uncommented

  /**
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
  */

  return await getLocalLearningObjectById(id, isTeacher);
}

/**
 * Haalt alle leerobjecten op die bij een leerpad horen (Dwengo + lokaal).
 */
export async function getLearningObjectsForPath(
  pathId: string,
  isTeacher: boolean,
): Promise<LearningObjectDto[]> {
  try {
    // need to find out if path is local or dwengo path, try dwengo first
    return await getLearningObjectsForDwengoPath(pathId, isTeacher);
  } catch (error) {
    if (error instanceof NotFoundError) {
      // if dwengo path not found, see if id matches with a local path
      return await getLearningObjectsForLocalPath(pathId, isTeacher);
    }
    throw error;
  }
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
    }
    // Rethrow de error als het geen NotFoundError is
    // Laat de error middleware dit afhandelen
    throw error;
  }
}
