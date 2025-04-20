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
}

/**
 * GET /teacher/learningPath/:learningPathId/node
 */
export const getNodesForPath = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const teacherId = getUserFromAuthRequest(req).id; // we weten: TEACHER
    const { learningPathId } = req.params;

    const nodes = await localLearningPathNodeService.getAllNodesForPath(
      teacherId,
      learningPathId,
    );
    res.json(nodes);
  },
);

/**
 * POST /teacher/learningPaths/:learningPathId/nodes
 * Body: NodeMetadata (zie interface), minimal required fields
 */
export const createNodeForPath = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const teacherId = getUserFromAuthRequest(req).id;
    const { learningPathId } = req.params;
    const body: NodeMetadata = req.body;

    const newNode = await localLearningPathNodeService.createNodeForPath(
      teacherId,
      learningPathId,
      {
        isExternal: !!body.isExternal,
        localLearningObjectId: body.localLearningObjectId,
        dwengoHruid: body.dwengoHruid,
        dwengoLanguage: body.dwengoLanguage,
        dwengoVersion: body.dwengoVersion,
        start_node: !!body.start_node,
      },
    );

    res.status(201).json({
      message: "Node successfully created.",
      node: newNode,
    });
  },
);

/**
 * PATCH /teacher/learningPaths/:learningPathId/nodes/:nodeId
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
 * DELETE /teacher/learningPaths/:learningPathId/nodes/:nodeId
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
