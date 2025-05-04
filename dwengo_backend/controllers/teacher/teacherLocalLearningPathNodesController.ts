import { Response } from "express";
import asyncHandler from "express-async-handler";
import { AuthenticatedRequest } from "../../interfaces/extendedTypeInterfaces";
import localLearningPathNodeService from "../../services/localLearningPathNodeService";
import { getUserFromAuthRequest } from "../../helpers/getUserFromAuthRequest";

// Interface voor node-updates
export interface NodeMetadata {
  isExternal: boolean;
  localLearningObjectId?: string;
  dwengoHruid?: string;
  dwengoLanguage?: string;
  dwengoVersion?: number;
  start_node?: boolean;
  nodeId?: string; // optional, only for existing nodes
}

/**
 * GET /learningPath/:learningPathId/node
 */
export const getNodesForPath = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const teacherId = getUserFromAuthRequest(req).id; // we weten: TEACHER
    const { learningPathId } = req.params;

    const nodes = await localLearningPathNodeService.getAllNodesForPath(
      teacherId,
      learningPathId,
      true, // include learning object info
    );
    res.json(nodes);
  },
);

/**
 * PATCH /learningPaths/:learningPathId/nodes/:nodeId
 * -> partial update of node
 */
export const updateNodeForPath = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const teacherId = getUserFromAuthRequest(req).id;
    const { learningPathId, nodeId } = req.params;
    const body: NodeMetadata = req.body;

    const updatedNode = await localLearningPathNodeService.updateNodeForPath(
      teacherId,
      learningPathId,
      nodeId,
      {
        isExternal: body.isExternal,
        localLearningObjectId: body.localLearningObjectId,
        dwengoHruid: body.dwengoHruid,
        dwengoLanguage: body.dwengoLanguage,
        dwengoVersion: body.dwengoVersion,
        start_node: body.start_node,
      },
    );

    res.json({
      message: "Node successfully updated.",
      node: updatedNode,
    });
  },
);

/**
 * DELETE /learningPaths/:learningPathId/nodes/:nodeId
 */
export const deleteNodeFromPath = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const teacherId = getUserFromAuthRequest(req).id;
    const { learningPathId, nodeId } = req.params;

    await localLearningPathNodeService.deleteNodeFromPath(
      teacherId,
      learningPathId,
      nodeId,
    );
    res.status(204).end();
  },
);

/**
 * POST /learningPaths/:learningPathId/node
 */
export const updateAllNodesForPath = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const teacherId = getUserFromAuthRequest(req).id;
    const { learningPathId } = req.params;
    const nodes: NodeMetadata[] = req.body;

    await localLearningPathNodeService.updateAllNodesForPath(
      teacherId,
      learningPathId,
      nodes,
    );

    res.json({
      message: "Nodes successfully updated.",
    });
  },
);
