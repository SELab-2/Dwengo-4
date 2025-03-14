import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { AuthenticatedRequest } from "../../interfaces/extendedTypeInterfaces";
import localLearningPathNodeService from "../../services/localLearningPathNodeService";

/**
 * GET /teacher/learningPaths/:pathId/nodes
 */
export const getNodesForPath = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const teacherId = req.user?.id;
    if (!teacherId || req.user?.role !== "TEACHER") {
      res.status(403);
      throw new Error("Niet geautoriseerd.");
    }

    const { pathId } = req.params;
    const nodes = await localLearningPathNodeService.getAllNodesForPath(
      teacherId,
      pathId
    );
    res.json(nodes);
  }
);

/**
 * POST /teacher/learningPaths/:pathId/nodes
 *  -> node maken
 */
export const createNodeForPath = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const teacherId = req.user?.id;
    if (!teacherId || req.user?.role !== "TEACHER") {
      res.status(403);
      throw new Error("Niet geautoriseerd.");
    }

    const { pathId } = req.params;
    // We verwachten dat de client "learningObjectRef" en "isExternal" opgeeft
    // + "start_node"
    const { learningObjectRef, isExternal, start_node } = req.body;

    if (!learningObjectRef) {
      res.status(400);
      throw new Error("learningObjectRef is vereist.");
    }

    const newNode = await localLearningPathNodeService.createNodeForPath(
      teacherId,
      pathId,
      {
        learningObjectRef,
        isExternal: !!isExternal,
        start_node: !!start_node,
      }
    );

    res.status(201).json({
      message: "Node aangemaakt",
      node: newNode,
    });
  }
);

/**
 * PUT /teacher/learningPaths/:pathId/nodes/:nodeId
 */
export const updateNodeForPath = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const teacherId = req.user?.id;
    if (!teacherId || req.user?.role !== "TEACHER") {
      res.status(403);
      throw new Error("Niet geautoriseerd.");
    }

    const { pathId, nodeId } = req.params;
    const { learningObjectRef, isExternal, start_node } = req.body;

    const updatedNode = await localLearningPathNodeService.updateNodeForPath(
      teacherId,
      pathId,
      nodeId,
      {
        learningObjectRef,
        isExternal,
        start_node,
      }
    );

    res.json({
      message: "Node bijgewerkt",
      node: updatedNode,
    });
  }
);

/**
 * DELETE /teacher/learningPaths/:pathId/nodes/:nodeId
 */
export const deleteNodeFromPath = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const teacherId = req.user?.id;
    if (!teacherId || req.user?.role !== "TEACHER") {
      res.status(403);
      throw new Error("Niet geautoriseerd.");
    }

    const { pathId, nodeId } = req.params;
    await localLearningPathNodeService.deleteNodeFromPath(teacherId, pathId, nodeId);
    res.json({ message: "Node verwijderd uit leerpad" });
  }
);
