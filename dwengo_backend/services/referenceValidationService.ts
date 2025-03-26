import { PrismaClient } from "@prisma/client";
import { dwengoAPI } from "../config/dwengoAPI";

const prisma = new PrismaClient();

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
    const lo = await prisma.learningObject.findUnique({
      where: { id: localId },
    });
    if (!lo) {
      throw new Error(`Lokaal leerobject '${localId}' niet gevonden.`);
    }
  }

  static async validateDwengoLearningObject(
    hruid: string,
    language: string,
    version: number
  ): Promise<void> {
    // Dwengo: GET /api/learningObject/getMetadata?hruid=xxx&language=xxx&version=xxx
    try {
      const resp = await dwengoAPI.get(
        `/api/learningObject/getMetadata?hruid=${hruid}&language=${language}&version=${version}`
      );
      if (!resp.data) {
        throw new Error(
          `Dwengo leerobject hruid=${hruid},language=${language},version=${version} => geen data ontvangen.`
        );
      }
    } catch (err: any) {
      if (err.response?.status === 404) {
        throw new Error(
          `Dwengo leerobject hruid=${hruid},language=${language},version=${version} niet gevonden (404).`
        );
      }
      throw new Error(`Fout bij Dwengo-check: ${err.message}`);
    }
  }

  /**
   * Als je maar één functie wilt om "either local or external object" te checken,
   * kun je deze wrapper schrijven:
   */
  static async validateLearningObject(
    isExternal: boolean,
    localId?: string,
    hruid?: string,
    language?: string,
    version?: number
  ): Promise<void> {
    if (isExternal) {
      if (!hruid || !language || version == null) {
        throw new Error("Missing Dwengo leerobject referenties (hruid/language/version)");
      }
      await this.validateDwengoLearningObject(hruid, language, version);
    } else {
      if (!localId) {
        throw new Error("Missing localId voor niet-externe leerobjectvalidatie");
      }
      await this.validateLocalLearningObject(localId);
    }
  }

  /**
   *  ===========================
   *  LEERPAD VALIDATIE
   *  ===========================
   */
  static async validateLocalLearningPath(localId: string): Promise<void> {
    const lp = await prisma.learningPath.findUnique({
      where: { id: localId },
    });
    if (!lp) {
      throw new Error(`Lokaal leerpad '${localId}' niet gevonden.`);
    }
  }

  static async validateDwengoLearningPath(hruid: string, language: string): Promise<void> {
    // Dwengo: /api/learningPath/search?hruid=...&language=...
    // (versie voor paden is meestal niet gedefinieerd in Dwengo)
    const resp = await dwengoAPI.get(
      `/api/learningPath/search?hruid=${hruid}&language=${language}`
    );
    if (!resp.data || !Array.isArray(resp.data) || resp.data.length === 0) {
      throw new Error(
        `Fout bij Dwengo-check leerpad: Dwengo leerpad (hruid=${hruid}, language=${language}) niet gevonden (lege array).`
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
    language?: string
  ): Promise<void> {
    if (isExternal) {
      if (!hruid || !language) {
        throw new Error("Missing Dwengo leerpad referenties (hruid/language)");
      }
      await this.validateDwengoLearningPath(hruid, language);
    } else {
      if (!localId) {
        throw new Error("Missing localId voor niet-externe leerpadvalidatie");
      }
      await this.validateLocalLearningPath(localId);
    }
  }
}
