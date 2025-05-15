import { dwengoAPI } from "../config/dwengoAPI";
import { BadRequestError } from "../errors/errors";
import {
  assertExists,
  assertArrayDwengoLearningPath,
  handleQueryWithExistenceCheck,
  throwCorrectNetworkError,
} from "../errors/errorFunctions";

import prisma from "../config/prisma";

/**
 * ReferenceValidationService:
 *  - Voor LOCAL => check in eigen DB (prisma)
 *  - Voor EXTERN => check bij Dwengo API (met hruid/language/version)
 */
export default class ReferenceValidationService {
  /**
   *  ===========================
   *  LEEROBJECT VALIDATIE
   *  ===========================
   */
  static async validateLocalLearningObject(localId: string): Promise<void> {
    await handleQueryWithExistenceCheck(
      () =>
        prisma.learningObject.findUnique({
          where: { id: localId },
        }),
      `Local learning object not found.`,
    );
  }

  static async validateDwengoLearningObject(
    hruid: string,
    language: string,
    version: number,
  ): Promise<void> {
    // Dwengo: GET /api/learningObject/getMetadata?hruid=xxx&language=xxx&version=xxx
    try {
      await assertExists(async () => {
        const resp = await dwengoAPI.get(
          `/api/learningObject/getMetadata?hruid=${hruid}&language=${language}&version=${version}`,
        );
        return resp.data;
      }, `Dwengo learning object hruid=${hruid},language=${language},version=${version} not found.`);
    } catch (error) {
      throwCorrectNetworkError(
        error as Error,
        "Could not fetch the requested learning object from the Dwengo API.",
      );
    }
  }

  /**
   * Als je maar één functie wilt om "either local or external object" te checken,
   * kun je deze wrapper schrijven:
   */
  /*static async validateLearningObject(
    isExternal: boolean,
    localId?: string,
    hruid?: string,
    language?: string,
    version?: number,
  ): Promise<void> {
    if (isExternal) {
      if (!hruid || !language || version == null) {
        throw new BadRequestError(
          "Missing Dwengo learning object references (hruid/language/version).",
        );
      }
      await this.validateDwengoLearningObject(hruid, language, version);
    } else {
      if (!localId) {
        throw new BadRequestError(
          "Missing localId for non-external learning object validation.",
        );
      }
      await this.validateLocalLearningObject(localId);
    }
  }*/

  /**
   *  ===========================
   *  LEERPAD VALIDATIE
   *  ===========================
   */
  static async validateLocalLearningPath(localId: string): Promise<void> {
    await handleQueryWithExistenceCheck(
      () =>
        prisma.learningPath.findUnique({
          where: { id: localId },
        }),
      `Learning path not found.`,
    );
  }

  static async validateDwengoLearningPath(
    hruid: string,
    language: string,
  ): Promise<void> {
    // Dwengo: /api/learningPath/search?hruid=...&language=...
    // (versie voor paden is meestal niet gedefinieerd in Dwengo)
    try {
      await assertArrayDwengoLearningPath(async () => {
        const resp = await dwengoAPI.get(
          `/api/learningPath/search?hruid=${hruid}&language=${language}`,
        );
        return resp.data;
      }, `Dwengo learning path (hruid=${hruid}, language=${language}) not found.`);
      // Eventueel checken of we exact 1 match hebben
    } catch (error) {
      throwCorrectNetworkError(
        error as Error,
        "Could not fetch the requested learning path from the Dwengo API.",
      );
    }
  }

  /**
   * Wrapper als je "externe vs lokaal" in één functie wilt:
   */
  static async validateLearningPath(
    isExternal: boolean,
    localId?: string,
    hruid?: string,
    language?: string,
  ): Promise<void> {
    if (isExternal) {
      if (!hruid || !language) {
        throw new BadRequestError(
          "Missing Dwengo leerpad references (hruid/language).",
        );
      }
      await this.validateDwengoLearningPath(hruid, language);
    } else {
      if (!localId) {
        throw new BadRequestError(
          "Missing localId for local learning path validation.",
        );
      }
      await this.validateLocalLearningPath(localId);
    }
  }
}
