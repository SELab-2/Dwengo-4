import { Response } from "express";
import asyncHandler from "express-async-handler";
import { AuthenticatedRequest } from "../../interfaces/extendedTypeInterfaces";
import LocalLearningPathService from "../../services/localLearningPathService";
import {
  getLearningPathByIdOrHruid,
  LearningPathDto,
  searchLearningPaths,
} from "../../services/learningPathService";
import { getUserFromAuthRequest } from "../../helpers/getUserFromAuthRequest";

/**
 * GET /teacher/allLearningPaths
 * Gets both local and API learning paths
 */
export const getAllLearningPaths = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    // Get local learning paths for the teacher
    const teacherId: number = getUserFromAuthRequest(req).id;
    const localPaths =
      await LocalLearningPathService.getAllLearningPathsByTeacher(teacherId);

    // Get all learning paths from API
    const apiPaths: LearningPathDto[] = await searchLearningPaths({ all: "" });

    // Combine local and API paths into a single array
    const combinedPaths = [...localPaths, ...apiPaths];

    // Return combined results
    res.json(combinedPaths);
  },
);

/**
 * GET /teacher/learningPath/:learningPathId
 * Gets a learning path by ID, either from local storage or API
 */
export const getLearningPathById = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const pathId: string = req.params.pathId;

    const { isExternal } = req.query; // Check if the path is external
    const isExternalBool =
      typeof isExternal === "string"
        ? isExternal.toLowerCase() === "true"
        : false;

    let learningPath;

    // Check if it's a local path (UUID format)
    if (!isExternalBool) {
      learningPath = await LocalLearningPathService.getLearningPathById(pathId);
    } else {
      // If not local, fetch from API
      learningPath = await getLearningPathByIdOrHruid(pathId);
    }

    res.json(learningPath);
  },
);
