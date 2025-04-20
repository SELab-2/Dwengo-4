import { Response } from "express";
import asyncHandler from "express-async-handler";
import { AuthenticatedRequest } from "../../interfaces/extendedTypeInterfaces";
import localLearningPathNodeService from "../../services/localLearningPathNodeService";

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
    const teacherId = req.user!.id; // we weten: TEACHER
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
 * POST /teacher/learningPaths/:learningPathId/nodes
 * Body: NodeMetadata (zie interface), minimal required fields
 */
export const createNodeForPath = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const teacherId = req.user!.id;
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
      message: "Node aangemaakt",
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
    const teacherId = req.user!.id;
    const { pathId, nodeId } = req.params;
    const body: NodeMetadata = req.body;

    const updatedNode = await localLearningPathNodeService.updateNodeForPath(
      teacherId,
      pathId,
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
      message: "Node bijgewerkt",
      node: updatedNode,
    });
  },
);

/**
 * DELETE /teacher/learningPaths/:learningPathId/nodes/:nodeId
 */
export const deleteNodeFromPath = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const teacherId = req.user!.id;
    const { pathId, nodeId } = req.params;

    await localLearningPathNodeService.deleteNodeFromPath(teacherId, pathId, nodeId);
    res.json({ message: "Node verwijderd uit leerpad" });
  },
);
