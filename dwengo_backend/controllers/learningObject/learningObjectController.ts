import { Request, Response } from "express";
import * as learningObjectService from "../../services/learningObjectService";

function userIsTeacherOrAdmin(req: Request): boolean {
  const role = (req as any).user?.role;
  return role === "TEACHER" || role === "ADMIN";
}

/**
 * Haalt alle leerobjecten op (via Dwengo-API, of eventueel lokale DB in de toekomst).
 * - Students zien enkel teacher_exclusive = false, available = true
 * - Teachers/Admins zien alles
 */
export const getAllLearningObjects = async (req: Request, res: Response): Promise<void> => {
  try {
    const isTeacher = userIsTeacherOrAdmin(req);
    const objects = await learningObjectService.getAllLearningObjects(isTeacher);
    res.json(objects);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Fout bij ophalen leerobjecten (Dwengo)" });
  }
};

/**
 * Haalt 1 leerobject op (op basis van ID => Dwengo '_id').
 * Als object teacher_exclusive is en user is geen teacher => 404.
 */
export const getLearningObject = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params; // string
    const isTeacher = userIsTeacherOrAdmin(req);

    const lo = await learningObjectService.getLearningObjectById(id, isTeacher);
    if (!lo) {
      res.status(404).json({ error: "Leerobject niet gevonden of geen toegang" });
      return;
    }

    res.json(lo);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Fout bij ophalen leerobject (Dwengo)" });
  }
};

/**
 * Zoekt leerobjecten via Dwengo /search
 * ?q=blabla => we geven 'searchTerm=blabla' mee in de service.
 */
export const searchLearningObjects = async (req: Request, res: Response): Promise<void> => {
  try {
    const searchTerm = req.query.q?.toString() || "";
    const isTeacher = userIsTeacherOrAdmin(req);

    const results = await learningObjectService.searchLearningObjects(isTeacher, searchTerm);
    res.json(results);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Fout bij zoeken naar leerobjecten (Dwengo)" });
  }
};

/**
 * Haalt alle leerobjecten op die bij een leerpad (pathId) horen.
 * Gebruikt getLearningObjectsForPath uit de service.
 */
export const getLearningObjectsForPath = async (req: Request, res: Response): Promise<void> => {
  try {
    const { pathId } = req.params; // string
    const isTeacher = userIsTeacherOrAdmin(req);

    const objects = await learningObjectService.getLearningObjectsForPath(pathId, isTeacher);
    res.json(objects);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Fout bij ophalen leerobjecten voor leerpad (Dwengo)" });
  }
};
