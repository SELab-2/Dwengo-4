
import { Request, Response } from "express";
import {
  searchAllLearningPaths,
  getCombinedLearningPathByIdOrHruid,
} from "../../services/combinedLearningPathService"; 
import { LearningPathDto } from "../../services/learningPathService";

/**
 * GET /learningPath?language=...&hruid=...&title=...&description=...&all=
 * Zoekt in Dwengo + lokale leerpaden
 */
export const searchLearningPathsController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const filters = {
      language: req.query.language?.toString(),
      hruid: req.query.hruid?.toString(),
      title: req.query.title?.toString(),
      description: req.query.description?.toString(),
      all: req.query.all?.toString(),
    };

    const results: LearningPathDto[] = await searchAllLearningPaths(filters);
    res.status(200).json(results);
    return; // STOP, return nothing (void)
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Fout bij zoeken van leerpaden." });
    return;
  }
};

/**
 * GET /learningPath/:pathId
 * Haalt 1 leerpad op (Dwengo of lokaal).
 */
export const getLearningPathByIdController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { pathId } = req.params;
    const path = await getCombinedLearningPathByIdOrHruid(pathId);

    if (!path) {
      res.status(404).json({ error: "Leerpad niet gevonden" });
      return;
    }
    // Stuur de data terug
    res.json(path);
    return; 
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Fout bij ophalen van leerpad." });
    return;
  }
};
