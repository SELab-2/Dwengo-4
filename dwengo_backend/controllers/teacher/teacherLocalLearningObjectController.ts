import { Response } from "express";
import asyncHandler from "express-async-handler";
import LocalLearningObjectService, {
  LocalLearningObjectData,
} from "../../services/localLearningObjectService";
import { AuthenticatedRequest } from "../../interfaces/extendedTypeInterfaces";
import { getTeacherFromAuthRequest } from "../../helpers/getUserFromAuthRequest";

/**
 * Maak een nieuw leerobject.
 */
export const createLocalLearningObject = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const teacherId = getTeacherFromAuthRequest(req).id;

    const data: LocalLearningObjectData = req.body;
    // Eventuele extra validatie (bv. velden checken) kan hier

    const createdLO = await LocalLearningObjectService.createLearningObject(
      teacherId,
      data,
    );
    res.status(201).json({
      message: "Learning object successfully created.",
      learningObject: createdLO,
    });
  },
);

/**
 * Haal alle leerobjecten op van deze teacher.
 */
export const getLocalLearningObjects = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const teacherId = getTeacherFromAuthRequest(req).id;
    const objects =
      await LocalLearningObjectService.getAllLearningObjectsByTeacher(
        teacherId,
      );
    res.json(objects);
  },
);

/**
 * Haal één leerobject op.
 */
export const getLocalLearningObjectById = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const teacherId = getTeacherFromAuthRequest(req).id;
    const { id } = req.params;
    const found = await LocalLearningObjectService.getLearningObjectById(id);

    // Check of deze teacher de eigenaar is
    if (found.creatorId !== teacherId) {
      res.status(403);
      throw new Error("Je bent niet de eigenaar van dit leerobject");
    }

    res.json(found);
  },
);

/**
 * Update een leerobject.
 */
export const updateLocalLearningObject = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const teacherId = req.user?.id;
    if (!teacherId) {
      res.status(401);
      throw new Error("Geen geldige teacher-gebruiker.");
    }

    const { id } = req.params;
    const data: Partial<LocalLearningObjectData> = req.body;

    // Check of leerobject bestaat en van deze teacher is
    const existing = await LocalLearningObjectService.getLearningObjectById(id);
    if (!existing) {
      res.status(404);
      throw new Error("Leerobject niet gevonden");
    }
    if (existing.creatorId !== teacherId) {
      res.status(403);
      throw new Error("Je bent niet de eigenaar van dit leerobject");
    }

    const updated = await LocalLearningObjectService.updateLearningObject(
      id,
      data,
    );
    res.json({
      message: "Leerobject bijgewerkt",
      learningObject: updated,
    });
  },
);

/**
 * Verwijder een leerobject.
 */
export const deleteLocalLearningObject = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const teacherId = req.user?.id;
    if (!teacherId) {
      res.status(401);
      throw new Error("Geen geldige teacher-gebruiker.");
    }

    const { id } = req.params;
    const existing = await LocalLearningObjectService.getLearningObjectById(id);
    if (!existing) {
      res.status(404);
      throw new Error("Leerobject niet gevonden");
    }
    if (existing.creatorId !== teacherId) {
      res.status(403);
      throw new Error("Je bent niet de eigenaar van dit leerobject");
    }

    await LocalLearningObjectService.deleteLearningObject(id);
    res.json({ message: "Leerobject verwijderd" });
  },
);
