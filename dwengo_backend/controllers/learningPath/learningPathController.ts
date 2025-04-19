import { Request, Response } from "express";
import {
  searchLearningPaths,
  getLearningPathByIdOrHruid,
  LearningPathDto,
} from "../../services/learningPathService";
import asyncHandler from "express-async-handler";

interface LearningPathFilters {
  language?: string;
  hruid?: string;
  title?: string;
  description?: string;
  all?: string;
}

/**
 * Zoekt leerpaden via Dwengo-API.
 * Mogelijke queryparams:
 *  ?language=nl
 *  ?hruid=...
 *  ?title=...
 *  ?description=...
 *  ?all=  (leeg om alles op te halen)
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

    const results: LearningPathDto[] = await searchLearningPaths(filters);
    res.json(results);
  },
);

/**
 * Haalt 1 leerpad op (op basis van _id of hruid).
 * We gebruiken de service getLearningPathByIdOrHruid voor 'idOrHruid'
 */
export const getLearningPathByIdController = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { pathId } = req.params; // pathId is een string
    const path: LearningPathDto = await getLearningPathByIdOrHruid(pathId);
    res.json(path);
  },
);
