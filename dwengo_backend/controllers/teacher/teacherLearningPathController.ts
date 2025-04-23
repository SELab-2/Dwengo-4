import { Response } from "express";
import asyncHandler from "express-async-handler";
import { AuthenticatedRequest } from "../../interfaces/extendedTypeInterfaces";
import LocalLearningPathService from "../../services/localLearningPathService";
import {
  getLearningPathByIdOrHruid,
  searchLearningPaths,
} from "../../services/learningPathService";

/**
 * GET /teacher/allLearningPaths
 * Gets both local and API learning paths
 */
export const getAllLearningPaths = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      // Get local learning paths for the teacher
      const teacherId = req.user!.id;
      const localPaths =
        await LocalLearningPathService.getAllLearningPathsByTeacher(teacherId);

      // Get all learning paths from API
      const apiPaths = await searchLearningPaths({ all: "" });

      // Combine local and API paths into a single array
      const combinedPaths = [...localPaths, ...apiPaths];

      // Return combined results
      res.json(combinedPaths);
    } catch (error) {
      res.status(500);
      throw new Error("Failed to fetch learning paths: " + error);
    }
  },
);

/**
 * GET /teacher/learningPath/:learningPathId
 * Gets a learning path by ID, either from local storage or API
 */
export const getLearningPathById = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const pathId = req.params.pathId;
      const { isExternal } = req.query; // Check if the path is external
      const isExternalBool =
        typeof isExternal === "string"
          ? isExternal.toLowerCase() === "true"
          : false;
      let learningPath;

      // Check if it's a local path (UUID format)
      if (!isExternalBool) {
        learningPath =
          await LocalLearningPathService.getLearningPathById(pathId);
      } else {
        // If not local, fetch from API
        learningPath = await getLearningPathByIdOrHruid(pathId);
      }

      if (!learningPath) {
        res.status(404);
        throw new Error("Learning path not found");
      }

      res.json(learningPath);
    } catch (error) {
      res.status(500);
      throw new Error("Failed to fetch learning path: " + error);
    }
  },
);
