
import { PrismaClient, LearningPathNode } from "@prisma/client";
import localLearningPathService from "./localLearningPathService";
import { dwengoAPI } from "../config/dwengoAPI";

const prisma = new PrismaClient();

/**
 * Data object om een node te maken/updaten.
 */
interface NodeData {
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
   * Creëer nieuwe node in path. We checken of de referentie klopt (lokale of Dwengo).
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

    // 2) Node maken in DB
    const newNode = await prisma.learningPathNode.create({
      data: {
        learningPathId: pathId,
        isExternal: data.isExternal,

        // Lokale of Dwengo-velden conditioneel
        localLearningObjectId: data.isExternal
          ? undefined
          : data.localLearningObjectId,
        dwengoHruid: data.isExternal ? data.dwengoHruid : undefined,
        dwengoLanguage: data.isExternal ? data.dwengoLanguage : undefined,
        dwengoVersion: data.isExternal ? data.dwengoVersion : undefined,

        start_node: data.start_node ?? false,
      },
    });

    // 3) Aantal nodes bijwerken in leerpad
    await localLearningPathService.updateNumNodes(pathId);

    return newNode;
  }

  /**
   * Update existing node
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

    // check of men echt iets aangepast heeft
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
      // isExternal ongewijzigd, maar misschien men geeft nieuwe LORef mee
      if (newIsExternal) {
        const newHruid =
          data.dwengoHruid !== undefined ? data.dwengoHruid : newDwengoHruid;
        const newLang =
          data.dwengoLanguage !== undefined
            ? data.dwengoLanguage
            : newDwengoLanguage;
        const newVer =
          data.dwengoVersion !== undefined
            ? data.dwengoVersion
            : newDwengoVersion;

        if (data.dwengoHruid !== undefined || data.dwengoLanguage !== undefined || data.dwengoVersion !== undefined) {
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

    const updatedNode = await prisma.learningPathNode.update({
      where: { nodeId },
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

    // Je verandert niet het aantal nodes; geen updateNumNodes nodig
    return updatedNode;
  }

  /**
   * Verwijder node. Update num_nodes nadien.
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

    await prisma.learningPathNode.delete({
      where: { nodeId },
    });

    await localLearningPathService.updateNumNodes(pathId);
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
   *  Nu met hruid/language/version:
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
