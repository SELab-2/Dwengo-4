import { Request, Response } from "express";
import {
  searchAllLearningPaths,
  getCombinedLearningPathByIdOrHruid,
} from "../../services/combinedLearningPathService";
import { LearningPathDto } from "../../services/learningPathService";
import asyncHandler from "express-async-handler";

interface LearningPathFilters {
  language?: string;
  hruid?: string;
  title?: string;
  description?: string;
  all?: string;
}

/**
 * GET /learningPath?language=...&hruid=...&title=...&description=...&all=
 * Zoekt in Dwengo + lokale leerpaden
 */
export const searchLearningPathsController = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const filters: LearningPathFilters = {
      language: req.query.language?.toString(),
      hruid: req.query.hruid?.toString(),
      title: req.query.title?.toString(),
      description: req.query.description?.toString(),
      all: req.query.all?.toString(),
    };

    const results: LearningPathDto[] = await searchAllLearningPaths(filters);
    res.json(results);
  },
);

/**
 * GET /learningPath/:pathId
 * Haalt 1 leerpad op (Dwengo of lokaal).
 */
export const getLearningPathByIdController = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { pathId } = req.params; // pathId is een string
    const path: LearningPathDto =
      await getCombinedLearningPathByIdOrHruid(pathId);

    res.json(path);
  },
);
