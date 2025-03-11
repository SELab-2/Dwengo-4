import { Request, Response } from "express";
import {
  getAllLearningObjects,
  getLearningObjectById,
  searchLearningObjects,
  getLearningObjectsForPath,
  // [NIEUW] importeer de nieuwe service-functie:
  getLearningObjectByHruidLangVersion,
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

// Haal alle leerobjecten (Dwengo + lokaal)
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

// Haal één leerobject op (via :id)
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

// Zoeken naar leerobjecten (Dwengo + lokaal)
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

// Haal alle leerobjecten op die horen bij een specifiek leerpad (op basis van pathId)
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

// [NIEUW] Haal één leerobject op basis van hruid + language + version
export const getLearningObjectByHruidLangVersionController = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  
  try {
    const { hruid, language, version } = req.query;
    if (!hruid || !language || !version) {
      res.status(400).json({
        error: "Geef hruid, language en version op als queryparameters, bv. ?hruid=xxx&language=nl&version=2",
      });
      return;
    }

    const isTeacher: boolean = userIsTeacherOrAdmin(req);
    const verNum = parseInt(version.toString(), 10);
    if (isNaN(verNum)) {
      res.status(400).json({ error: "Version moet een getal zijn." });
      return;
    }

    // Servicecall
    const lo = await getLearningObjectByHruidLangVersion(
      hruid.toString(),
      language.toString(),
      verNum,
      isTeacher
    );

    if (!lo) {
      res.status(404).json({
        error: "Geen leerobject gevonden (of je hebt geen toegang) met deze hruid-language-version",
      });
      return;
    }

    res.json(lo);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Fout bij ophalen leerobject op basis van hruid-language-version" });
  }
};
