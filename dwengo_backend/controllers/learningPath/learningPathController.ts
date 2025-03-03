import { Request, Response } from "express";
import * as learningPathService from "../../services/learningPathService";

/**
 * Zoekt leerpaden via Dwengo-API. 
 * Mogelijke queryparams:
 *  ?language=nl
 *  ?hruid=...
 *  ?title=...
 *  ?description=...
 *  ?all=  (leeg om alles op te halen)
 */
export const searchLearningPaths = async (req: Request, res: Response): Promise<void> => {
  try {
    // Haal filters uit req.query
    const filters = {
      language: req.query.language?.toString(),
      hruid: req.query.hruid?.toString(),
      title: req.query.title?.toString(),
      description: req.query.description?.toString(),
      all: req.query.all?.toString() // bijv. "" of undefined
    };

    const results = await learningPathService.searchLearningPaths(filters);
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
export const getLearningPathById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { pathId } = req.params; // string
    const path = await learningPathService.getLearningPathByIdOrHruid(pathId);

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
