import { Response } from "express";
import {
  getAllLearningObjects,
  getLearningObjectByHruidLangVersion,
  getLearningObjectById,
  getLearningObjectsForPath,
  searchLearningObjects,
} from "../../services/combinedLearningObjectService";
import asyncHandler from "express-async-handler";
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
    res.json(objects);
  },
);

// Haal één leerobject op (via: id)
export const getLearningObjectController = asyncHandler(
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { learningObjectId } = req.params;
    const isTeacher: boolean = userIsTeacherOrAdmin(req);
    const lo: LearningObjectDto = await getLearningObjectById(
      learningObjectId,
      isTeacher,
    );
    res.json(lo);
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
    res.json(results);
  },
);

// Haal alle leerobjecten op die horen bij een specifiek leerpad (op basis van pathId)
export const getLearningObjectsForPathController = asyncHandler(
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { learningPathId } = req.params;
    const isTeacher: boolean = userIsTeacherOrAdmin(req);
    const objects: LearningObjectDto[] = await getLearningObjectsForPath(
      learningPathId,
      isTeacher,
    );
    res.json(objects);
  },
);

// [NIEUW] Haal één leerobject op basis van hruid + language + version
export const getLearningObjectByHruidLangVersionController = asyncHandler(
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { hruid, language, version } = req.params;

    const isTeacher: boolean = userIsTeacherOrAdmin(req);
    const verNum: number = Number(version);

    // Servicecall
    const lo: LearningObjectDto = await getLearningObjectByHruidLangVersion(
      hruid.toString(),
      language.toString(),
      verNum,
      isTeacher,
    );

    res.json(lo);
  },
);
