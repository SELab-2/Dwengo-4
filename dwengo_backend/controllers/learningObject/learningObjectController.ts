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
 * Haalt alle leerobjecten op via de Dwengo-API (of later lokale DB).
 * Studenten zien enkel objecten met teacherExclusive = false en available = true.
 * Teachers/Admins zien alle objecten.
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
    res.status(500).json({ error: "Fout bij ophalen leerobjecten (Dwengo)" });
  }
};

/**
 * Haalt één leerobject op op basis van de Dwengo '_id'. 
 * Als het object teacherExclusive is en de gebruiker geen teacher is, wordt null geretourneerd.
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
    res.status(500).json({ error: "Fout bij ophalen leerobject (Dwengo)" });
  }
};

/**
 * Zoekt naar leerobjecten via de Dwengo-API.
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
    res.status(500).json({ error: "Fout bij zoeken naar leerobjecten (Dwengo)" });
  }
};

/**
 * Haalt alle leerobjecten op die bij een leerpad horen (op basis van pathId).
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
