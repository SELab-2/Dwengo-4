import { PrismaClient, LearningPathNode } from "@prisma/client";
import localLearningPathService from "./localLearningPathService";
import { dwengoAPI } from "../config/dwengoAPI";

const prisma = new PrismaClient();

interface NodeData {
  learningObjectRef?: string; // ID (lokaal of extern)
  isExternal?: boolean;
  start_node?: boolean;
}

class LocalLearningPathNodeService {

  /**
   * Helper: controleer of de teacher de eigenaar is van 'pathId'
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
  async getAllNodesForPath(teacherId: number, pathId: string): Promise<LearningPathNode[]> {
    await this.checkTeacherOwnsPath(teacherId, pathId);
    return prisma.learningPathNode.findMany({
      where: { learningPathId: pathId },
      orderBy: { createdAt: "asc" },
    });
  }

  /**
   * Creëer nieuwe node in path. We checken of learningObjectRef klopt:
   *  - if isExternal => check Dwengo-API
   *  - else => check local DB
   */
  async createNodeForPath(
    teacherId: number,
    pathId: string,
    data: Required<NodeData>
  ): Promise<LearningPathNode> {
    await this.checkTeacherOwnsPath(teacherId, pathId);

    // Validate learningObjectRef
    if (data.isExternal) {
      await this.validateDwengoObject(data.learningObjectRef);
    } else {
      await this.validateLocalObject(data.learningObjectRef);
    }

    // Maak node
    const newNode = await prisma.learningPathNode.create({
      data: {
        learningPathId: pathId,
        learningObjectRef: data.learningObjectRef,
        isExternal: data.isExternal,
        start_node: data.start_node ?? false,
      },
    });

    // num_nodes updaten
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

    const newLORef = data.learningObjectRef ?? node.learningObjectRef;
    const newIsExternal = data.isExternal ?? node.isExternal;

    // Als de user wel een nieuwe LORef opgeeft, checken we opnieuw validiteit
    if (data.learningObjectRef !== undefined || data.isExternal !== undefined) {
      if (newIsExternal) {
        await this.validateDwengoObject(newLORef);
      } else {
        await this.validateLocalObject(newLORef);
      }
    }

    const updatedNode = await prisma.learningPathNode.update({
      where: { nodeId },
      data: {
        learningObjectRef: newLORef,
        isExternal: newIsExternal,
        start_node: data.start_node ?? node.start_node,
      },
    });
    // Update van node-veld verandert niet het aantal => num_nodes blijft gelijk
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
   * 1) Check of local LearningObject bestaat
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
   * 2) Check of external Dwengo object bestaat
   *    (bijv. door getMetadata-call)
   */
  private async validateDwengoObject(dwengoId: string): Promise<void> {
    try {
      // bv. /learningObject/getMetadata?_id=<dwengoId>
      // of /learningObject/getMetadata?hruid=...
      // Pas dit aan aan wat Dwengo exact verwacht.
      const resp = await dwengoAPI.get(
        `/api/learningObject/getMetadata?_id=${dwengoId}`
      );
      if (!resp.data) {
        throw new Error(`Dwengo-object met ID='${dwengoId}' niet gevonden (lege data).`);
      }
    } catch (err: any) {
      if (err.response && err.response.status === 404) {
        throw new Error(`Dwengo-object met ID='${dwengoId}' niet gevonden (404).`);
      } else {
        console.error(err);
        throw new Error(`Fout bij Dwengo-check: ${(err.response && err.response.data) || err.message}`);
      }
    }
  }
}

export default new LocalLearningPathNodeService();
