import { Response } from "express";
import asyncHandler from "express-async-handler";
import {
  getAllLearningObjects,
  getLearningObjectByHruidLangVersion,
  getLearningObjectById,
  getLearningObjectsForPath,
  searchLearningObjects,
} from "../../services/combinedLearningObjectService";
import { LearningObjectDto } from "../../services/dwengoLearningObjectService";
import { getUserFromAuthRequest } from "../../helpers/getUserFromAuthRequest";
import { AuthenticatedRequest } from "../../interfaces/extendedTypeInterfaces";

function userIsTeacherOrAdmin(req: AuthenticatedRequest): boolean {
  const role: string | undefined = getUserFromAuthRequest(req).role;
  return role === "TEACHER" || role === "ADMIN";
}

// Haal alle leerobjecten (Dwengo + lokaal)
export const getAllLearningObjectsController = asyncHandler(
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const isTeacher: boolean = userIsTeacherOrAdmin(req);
    const objects: LearningObjectDto[] = await getAllLearningObjects(isTeacher);
    res.json({ objects });
  },
);

// Haal één leerobject op (via :id)
export const getLearningObjectController = asyncHandler(
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { learningObjectId } = req.params;
    const isTeacher: boolean = userIsTeacherOrAdmin(req);
    const lo: LearningObjectDto | null = await getLearningObjectById(
      learningObjectId,
      isTeacher,
    );
    if (!lo) {
      res
        .status(404)
        .json({ error: "Leerobject niet gevonden of geen toegang" });
      return;
    }
    res.json({ learningObject: lo });
  },
);

// Zoeken naar leerobjecten (Dwengo + lokaal)
export const searchLearningObjectsController = asyncHandler(
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const searchTerm: string = req.query.q?.toString() || "";
    const isTeacher: boolean = userIsTeacherOrAdmin(req);
    const results: LearningObjectDto[] = await searchLearningObjects(
      isTeacher,
      searchTerm,
    );
    res.json({ results });
  },
);

// Haal alle leerobjecten op die horen bij een specifiek leerpad (op basis van pathId)
export const getLearningObjectsForPathController = asyncHandler(
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { pathId } = req.params;
    const isTeacher: boolean = userIsTeacherOrAdmin(req);
    const objects: LearningObjectDto[] = await getLearningObjectsForPath(
      pathId,
      isTeacher,
    );
    res.json({ objects });
  },
);

// [NIEUW] Haal één leerobject op basis van hruid + language + version
export const getLearningObjectByHruidLangVersionController = asyncHandler(
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { hruid, language, version } = req.query;
    if (!hruid || !language || !version) {
      res.status(400).json({
        error:
          "Geef hruid, language en version op als queryparameters, bv. ?hruid=xxx&language=nl&version=2",
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
      isTeacher,
    );

    if (!lo) {
      res.status(404).json({
        error:
          "Geen leerobject gevonden (of je hebt geen toegang) met deze hruid-language-version",
      });
      return;
    }

    res.json({ learningObject: lo });
  },
);
