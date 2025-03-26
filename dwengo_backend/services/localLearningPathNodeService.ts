import {LearningPathNode, PrismaClient} from "@prisma/client";
import {dwengoAPI} from "../config/dwengoAPI";

const prisma = new PrismaClient();

/**
 * Data object om een node te maken/updaten.
 */
export interface NodeData {
  isExternal: boolean;
  // Voor lokaal:
  localLearningObjectId?: string;

  // Voor Dwengo:
  dwengoHruid?: string;
  dwengoLanguage?: string;
  dwengoVersion?: number;

  // Overige eigenschappen:
  start_node?: boolean;
}

class LocalLearningPathNodeService {
  /**
   * Helper: check of de teacher de eigenaar is van leerpad 'pathId'
   */
  private async checkTeacherOwnsPath(teacherId: number, pathId: string) {
    const path = await prisma.learningPath.findUnique({
      where: { id: pathId },
    });
    if (!path) {
      throw new Error("Leerpad niet gevonden.");
    }
    if (path.creatorId !== teacherId) {
      throw new Error("Je bent niet de eigenaar van dit leerpad.");
    }
  }

  /**
   * Haal alle nodes van dit leerpad op.
   */
  async getAllNodesForPath(
    teacherId: number,
    pathId: string
  ): Promise<LearningPathNode[]> {
    await this.checkTeacherOwnsPath(teacherId, pathId);
    return prisma.learningPathNode.findMany({
      where: { learningPathId: pathId },
      orderBy: { createdAt: "asc" },
    });
  }

  /**
   * Creëer nieuwe node in path, atomaire transactie:
   *  1) Node maken
   *  2) Aantal nodes updaten
   */
  async createNodeForPath(
    teacherId: number,
    pathId: string,
    data: NodeData
  ): Promise<LearningPathNode> {
    await this.checkTeacherOwnsPath(teacherId, pathId);

    // 1) Valideer => afhankelijk van isExternal
    if (data.isExternal) {
      if (
        !data.dwengoHruid ||
        !data.dwengoLanguage ||
        typeof data.dwengoVersion !== "number"
      ) {
        throw new Error(
          "Missing Dwengo-fields: dwengoHruid, dwengoLanguage, dwengoVersion"
        );
      }
      await this.validateDwengoObject(
        data.dwengoHruid,
        data.dwengoLanguage,
        data.dwengoVersion
      );
    } else {
      if (!data.localLearningObjectId) {
        throw new Error("Missing localLearningObjectId for local node");
      }
      await this.validateLocalObject(data.localLearningObjectId);
    }

    // 2) Transactie:
    return prisma.$transaction(async (tx) => {
      // 2a) Node maken
      const newNode = await tx.learningPathNode.create({
        data: {
          learningPathId: pathId,
          isExternal: data.isExternal,

          localLearningObjectId: data.isExternal
              ? undefined
              : data.localLearningObjectId,
          dwengoHruid: data.isExternal ? data.dwengoHruid : undefined,
          dwengoLanguage: data.isExternal ? data.dwengoLanguage : undefined,
          dwengoVersion: data.isExternal ? data.dwengoVersion : undefined,

          start_node: data.start_node ?? false,
        },
      });

      // 2b) Aantal nodes bijwerken
      const count = await tx.learningPathNode.count({
        where: {learningPathId: pathId},
      });
      await tx.learningPath.update({
        where: {id: pathId},
        data: {num_nodes: count},
      });

      return newNode;
    });
  }

  /**
   * Update existing node
   * (Geen transactie nodig, want we doen 1 DB-call en we
   *  updaten niet het aantal nodes.)
   */
  async updateNodeForPath(
    teacherId: number,
    pathId: string,
    nodeId: string,
    data: NodeData
  ): Promise<LearningPathNode> {
    await this.checkTeacherOwnsPath(teacherId, pathId);

    const node = await prisma.learningPathNode.findUnique({
      where: { nodeId },
    });
    if (!node) {
      throw new Error("Node niet gevonden.");
    }
    if (node.learningPathId !== pathId) {
      throw new Error("Node hoort niet bij dit leerpad.");
    }

    // Bepaal de nieuwe velden (als de client niet alles meestuurt, fallback naar de bestaande)
    const newIsExternal = data.isExternal ?? node.isExternal;

    let newLocalLearningObjectId = node.localLearningObjectId;
    let newDwengoHruid = node.dwengoHruid;
    let newDwengoLanguage = node.dwengoLanguage;
    let newDwengoVersion = node.dwengoVersion;

    // check of men echt de toggle "extern/lokaal" heeft aangepast
    if (data.isExternal !== undefined) {
      // men heeft de "extern vs lokaal" toggle aangepast
      if (newIsExternal) {
        // van false => true
        if (
          !data.dwengoHruid ||
          !data.dwengoLanguage ||
          typeof data.dwengoVersion !== "number"
        ) {
          throw new Error(
            "Missing Dwengo fields for external node: hruid, language, version"
          );
        }
        await this.validateDwengoObject(
          data.dwengoHruid,
          data.dwengoLanguage,
          data.dwengoVersion
        );

        // overschrijf
        newDwengoHruid = data.dwengoHruid;
        newDwengoLanguage = data.dwengoLanguage;
        newDwengoVersion = data.dwengoVersion;

        // en wis local
        newLocalLearningObjectId = null;
      } else {
        // van true => false
        if (!data.localLearningObjectId) {
          throw new Error("Missing localLearningObjectId for local node");
        }
        await this.validateLocalObject(data.localLearningObjectId);

        newLocalLearningObjectId = data.localLearningObjectId;
        // wis dwengo
        newDwengoHruid = null;
        newDwengoLanguage = null;
        newDwengoVersion = null;
      }
    } else {
      // isExternal ongewijzigd, maar misschien men geeft een nieuwe LORef / DwengoRef mee
      if (newIsExternal) {
        // Dwengo
        const newHruid =
          data.dwengoHruid !== undefined ? data.dwengoHruid : newDwengoHruid;
        const newLang =
          data.dwengoLanguage !== undefined ? data.dwengoLanguage : newDwengoLanguage;
        const newVer =
          data.dwengoVersion !== undefined ? data.dwengoVersion : newDwengoVersion;

        if (
          data.dwengoHruid !== undefined ||
          data.dwengoLanguage !== undefined ||
          data.dwengoVersion !== undefined
        ) {
          // user gaf iets nieuws in Dwengo
          if (!newHruid || !newLang || typeof newVer !== "number") {
            throw new Error("Incomplete Dwengo info");
          }
          await this.validateDwengoObject(newHruid, newLang, newVer);
        }

        newDwengoHruid = newHruid;
        newDwengoLanguage = newLang;
        newDwengoVersion = newVer;
      } else {
        // lokaal node
        if (data.localLearningObjectId !== undefined) {
          // user gaf nieuwe local ID
          await this.validateLocalObject(data.localLearningObjectId);
          newLocalLearningObjectId = data.localLearningObjectId;
        }
      }
    }

    // Aantal nodes blijft hetzelfde → geen updateNumNodes nodig
    return prisma.learningPathNode.update({
      where: {nodeId},
      data: {
        isExternal: newIsExternal,
        localLearningObjectId: newIsExternal
            ? null
            : newLocalLearningObjectId ?? null,
        dwengoHruid: newIsExternal ? newDwengoHruid : null,
        dwengoLanguage: newIsExternal ? newDwengoLanguage : null,
        dwengoVersion: newIsExternal ? newDwengoVersion : null,
        start_node: data.start_node ?? node.start_node,
      },
    });
  }

  /**
   * Verwijder node. 
   * Atomaire transactie (2 acties):
   *   1) Node verwijderen
   *   2) Aantal nodes herberekenen
   */
  async deleteNodeFromPath(
    teacherId: number,
    pathId: string,
    nodeId: string
  ): Promise<void> {
    await this.checkTeacherOwnsPath(teacherId, pathId);

    const node = await prisma.learningPathNode.findUnique({
      where: { nodeId },
    });
    if (!node) {
      throw new Error("Node niet gevonden.");
    }
    if (node.learningPathId !== pathId) {
      throw new Error("Node hoort niet bij dit leerpad.");
    }

    await prisma.$transaction(async (tx) => {
      // 1) Node verwijderen
      await tx.learningPathNode.delete({
        where: { nodeId },
      });

      // 2) Aantal nodes herberekenen
      const count = await tx.learningPathNode.count({
        where: { learningPathId: pathId },
      });
      await tx.learningPath.update({
        where: { id: pathId },
        data: { num_nodes: count },
      });
    });
  }

  /**
   *  ================================
   *  1) Check of local LearningObject bestaat
   *  ================================
   */
  private async validateLocalObject(loId: string): Promise<void> {
    const exists = await prisma.learningObject.findUnique({
      where: { id: loId },
    });
    if (!exists) {
      throw new Error(`Lokaal leerobject '${loId}' niet gevonden.`);
    }
  }

  /**
   *  ================================
   *  2) Check of external Dwengo object bestaat
   *  ================================
   */
  private async validateDwengoObject(
    hruid: string,
    language: string,
    version: number
  ): Promise<void> {
    try {
      const resp = await dwengoAPI.get(
        `/api/learningObject/getMetadata?hruid=${hruid}&language=${language}&version=${version}`
      );
      if (!resp.data) {
        throw new Error(
          `Dwengo-object (hruid=${hruid}, lang=${language}, ver=${version}) niet gevonden (lege data).`
        );
      }
    } catch (err: any) {
      if (err.response?.status === 404) {
        throw new Error(
          `Dwengo-object (hruid=${hruid}, lang=${language}, ver=${version}) niet gevonden (404).`
        );
      } else {
        console.error(err);
        throw new Error(
          `Fout bij Dwengo-check: ${
            (err.response && err.response.data) || err.message
          }`
        );
      }
    }
  }
}

export default new LocalLearningPathNodeService();
