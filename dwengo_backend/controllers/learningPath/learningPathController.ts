import { Request, Response } from "express";
import { searchLearningPaths, getLearningPathByIdOrHruid, LearningPathDto } from "../../services/learningPathService";

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
export const searchLearningPathsController = async (req: Request, res: Response): Promise<void> => {
  try {
    const filters: LearningPathFilters = {
      language: req.query.language?.toString(),
      hruid: req.query.hruid?.toString(),
      title: req.query.title?.toString(),
      description: req.query.description?.toString(),
      all: req.query.all?.toString(),
    };

    const results: LearningPathDto[] = await searchLearningPaths(filters);
    res.json(results);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Fout bij zoeken naar leerpaden" });
  }
};

/**
 * Haalt 1 leerpad op (op basis van _id of hruid).
 * We gebruiken de service getLearningPathByIdOrHruid voor 'idOrHruid'
 */
export const getLearningPathByIdController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { pathId } = req.params; // pathId is een string
    const path: LearningPathDto | null = await getLearningPathByIdOrHruid(pathId);

    if (!path) {
      res.status(404).json({ error: "Leerpad niet gevonden" });
      return;
    }

    res.json(path);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Fout bij ophalen leerpad" });
  }
};
