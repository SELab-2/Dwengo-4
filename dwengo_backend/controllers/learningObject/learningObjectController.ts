import { Request, Response } from "express";
import {
  getAllLearningObjects,
  getLearningObjectById,
  searchLearningObjects,
  getLearningObjectsForPath,
  LearningObjectDto,
} from "../../services/learningObjectService";

/**
 * Een type voor een Request met een getypeerde user-property.
 */
interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    role: string;
  };
}

/**
 * Bepaalt of de ingelogde gebruiker TEACHER of ADMIN is.
 */
function userIsTeacherOrAdmin(req: AuthenticatedRequest): boolean {
  const role: string | undefined = req.user?.role;
  return role === "TEACHER" || role === "ADMIN";
}

/**
 * Haalt alle leerobjecten op (Dwengo + Lokaal)
 * Studenten zien enkel teacherExclusive=false + available=true (zowel Dwengo als lokaal).
 */
export const getAllLearningObjectsController = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const isTeacher: boolean = userIsTeacherOrAdmin(req);
    const objects: LearningObjectDto[] = await getAllLearningObjects(isTeacher);
    res.json(objects);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Fout bij ophalen leerobjecten (combi Dwengo + local)" });
  }
};

/**
 * Haalt één leerobject op op basis van het ID.
 * - Probeert eerst Dwengo
 * - Als niet gevonden, zoekt in de lokale DB.
 * - Filtert teacherExclusive/available als req.user geen teacher is.
 */
export const getLearningObjectController = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const isTeacher: boolean = userIsTeacherOrAdmin(req);
    const lo: LearningObjectDto | null = await getLearningObjectById(id, isTeacher);
    if (!lo) {
      res.status(404).json({ error: "Leerobject niet gevonden of geen toegang" });
      return;
    }
    res.json(lo);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Fout bij ophalen leerobject (combi Dwengo + local)" });
  }
};

/**
 * Zoekt naar leerobjecten (Dwengo + Lokaal).
 * Queryparameter ?q= wordt als searchTerm doorgegeven.
 */
export const searchLearningObjectsController = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const searchTerm: string = req.query.q?.toString() || "";
    const isTeacher: boolean = userIsTeacherOrAdmin(req);
    const results: LearningObjectDto[] = await searchLearningObjects(isTeacher, searchTerm);
    res.json(results);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Fout bij zoeken naar leerobjecten (combi Dwengo + local)" });
  }
};

/**
 * Haalt alle leerobjecten op die bij een leerpad (Dwengo) horen.
 * (Voorlopig alleen Dwengo-nodes. Als je eigen leerpaden hebt, kun je
 *  soortgelijke logica toevoegen in de service.)
 */
export const getLearningObjectsForPathController = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { pathId } = req.params;
    const isTeacher: boolean = userIsTeacherOrAdmin(req);
    const objects: LearningObjectDto[] = await getLearningObjectsForPath(pathId, isTeacher);
    res.json(objects);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Fout bij ophalen leerobjecten voor leerpad (Dwengo)" });
  }
};
