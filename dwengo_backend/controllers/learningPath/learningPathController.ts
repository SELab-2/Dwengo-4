import { Request, Response } from "express";
import {
  searchAllLearningPaths,
  getCombinedLearningPathByIdOrHruid,
} from "../../services/combinedLearningPathService";
import { LearningPathDto, LearningPathTransition } from "../../services/learningPathService";
import asyncHandler from "express-async-handler";
import { getUserFromAuthRequest } from "../../helpers/getUserFromAuthRequest";
import LocalLearningPathService from "../../services/localLearningPathService";

interface LearningPathFilters {
  language?: string;
  hruid?: string;
  title?: string;
  description?: string;
  all?: string;
  includeProgress?: string;
}

/**
 * GET /learningPath?language=...&hruid=...&title=...&description=...&all=&includeProgress=true
 * Zoekt in Dwengo + lokale leerpaden.
 */
export const searchLearningPathsController = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const filters: LearningPathFilters = {
      language: req.query.language?.toString(),
      hruid: req.query.hruid?.toString(),
      title: req.query.title?.toString(),
      description: req.query.description?.toString(),
      all: req.query.all?.toString(),
      includeProgress: req.query.includeProgress?.toString(),
    };

    const results: LearningPathDto[] = await searchAllLearningPaths(filters);
    res.json(results);
  },
);

/**
 * GET /learningPath/:pathId?includeProgress=true
 * Haalt 1 leerpad op (Dwengo of lokaal), mét optioneel de voortgang voor de ingelogde student.
 */
export const getLearningPathByIdController = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { pathId } = req.params;
    const includeProgress = req.query.includeProgress === "true";

    // Haal de ingelogde user op (metaal van middleware)
    const user = getUserFromAuthRequest(req);
    const studentId = user?.role === "STUDENT" ? user.id : undefined;

    const path: LearningPathDto = await getCombinedLearningPathByIdOrHruid(
      pathId,
      includeProgress,
      studentId,
    );

    res.json(path);
  },
);


export const getLearningPathTransitionsController = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { pathId } = req.params;
    const transitions: LearningPathTransition[] =
      await LocalLearningPathService.getTransitionsByPath(pathId);


    res.json({ transitions });
  },
);
