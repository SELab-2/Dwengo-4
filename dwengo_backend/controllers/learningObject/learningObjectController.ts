import { Request, Response } from "express";
import {
  getAllLearningObjects,
  getLearningObjectById,
  searchLearningObjects,
  getLearningObjectsForPath,

} from "../../services/combinedLearningObjectService";
import { LearningObjectDto } from "../../services/dwengoLearningObjectService";

interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    role: string;
  };
}

function userIsTeacherOrAdmin(req: AuthenticatedRequest): boolean {
  const role: string | undefined = req.user?.role;
  return role === "TEACHER" || role === "ADMIN";
}

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
