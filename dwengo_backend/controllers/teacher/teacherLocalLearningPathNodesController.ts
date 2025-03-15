
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
 *  -> node aanmaken
 *  -> Body-velden:
 *     {
 *       "isExternal": true/false,
 *       // Als extern: dwengoHruid, dwengoLanguage, dwengoVersion
 *       // Als lokaal: localLearningObjectId
 *       "start_node": bool
 *     }
 */
export const createNodeForPath = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const teacherId = req.user?.id;
    if (!teacherId || req.user?.role !== "TEACHER") {
      res.status(403);
      throw new Error("Niet geautoriseerd.");
    }

    const { pathId } = req.params;
    const {
      isExternal,
      localLearningObjectId,
      dwengoHruid,
      dwengoLanguage,
      dwengoVersion,
      start_node,
    } = req.body;

    // Overdragen naar service
    const newNode = await localLearningPathNodeService.createNodeForPath(teacherId, pathId, {
      isExternal: !!isExternal,
      localLearningObjectId,
      dwengoHruid,
      dwengoLanguage,
      dwengoVersion,
      start_node: !!start_node,
    });

    res.status(201).json({
      message: "Node aangemaakt",
      node: newNode,
    });
  }
);

/**
 * PUT /teacher/learningPaths/:pathId/nodes/:nodeId
 * -> node updaten
 * -> Body-velden (optioneel):
 *     {
 *       "isExternal": true/false,
 *       "localLearningObjectId": "...",
 *       "dwengoHruid": "...",
 *       "dwengoLanguage": "...",
 *       "dwengoVersion": number,
 *       "start_node": bool
 *     }
 */
export const updateNodeForPath = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const teacherId = req.user?.id;
    if (!teacherId || req.user?.role !== "TEACHER") {
      res.status(403);
      throw new Error("Niet geautoriseerd.");
    }

    const { pathId, nodeId } = req.params;
    const {
      isExternal,
      localLearningObjectId,
      dwengoHruid,
      dwengoLanguage,
      dwengoVersion,
      start_node,
    } = req.body;

    const updatedNode = await localLearningPathNodeService.updateNodeForPath(
      teacherId,
      pathId,
      nodeId,
      {
        isExternal,
        localLearningObjectId,
        dwengoHruid,
        dwengoLanguage,
        dwengoVersion,
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
