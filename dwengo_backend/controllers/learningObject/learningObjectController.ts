import { Request, Response } from "express";
import * as learningObjectService from "../../services/learningObjectService";

function userIsTeacherOrAdmin(req: Request): boolean {
  const role = (req as any).user?.role;
  return role === "TEACHER" || role === "ADMIN"; //admin is voorlopig nog overbodig, kan later misschien worden wgegelaten
}

/**
 * Haalt alle leerobjecten op (via Dwengo-API, of eventueel lokale DB in de toekomst).
 * - Students zien enkel teacher_exclusive = false, (available = true ook?)
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
 * Haalt 1 leerobject op (op basis van ID => Dwengo '_id', hruid, etc.).
 * Als object teacher_exclusive is en user is geen teacher => 404. 
 */
export const getLearningObject = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const isTeacher = userIsTeacherOrAdmin(req);
  
      const lo = await learningObjectService.getLearningObjectById(id, isTeacher);
      if (!lo) {
        res.status(404).json({ error: "Leerobject niet gevonden of geen toegang" });
        return; // Stop de functie hier, maar keer niet terug met een "Response" type
      }
  
      res.json(lo);
      // Eventueel hier ook een return; als je wilt aangeven dat de functie stopt
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Fout bij ophalen leerobject (Dwengo)" });
    }
  };
  

/**
 * Zoekt leerobjecten via Dwengo /search.
 * ?q=blabla => we geven 'searchTerm=blabla' mee in de service. kunnen later bv ook nog op difficulty enzo zoeken
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
 * Haalt alle leerobjecten op d,ie bij een leerpad (pathId) hore
 * Op basis van de DwengoAPI is dit groteendeels 'mocked' – zie service code.
 */
export const getLearningObjectsForPath = async (req: Request, res: Response): Promise<void> => {
  try {
    const { pathId } = req.params;
    const isTeacher = userIsTeacherOrAdmin(req);
    const pathIdNum = Number(pathId);

    const objects = await learningObjectService.getLearningObjectsForPath(pathIdNum, isTeacher);
    res.json(objects);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Fout bij ophalen leerobjecten voor leerpad (Dwengo)" });
  }
};
