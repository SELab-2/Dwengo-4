import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import LocalLearningObjectService, { LocalLearningObjectData } from "../../services/localLearningObjectService";
import { AuthenticatedRequest } from "../../middleware/teacherAuthMiddleware";

/**
 * Maak een nieuw leerobject.
 * POST /teacher/learningObjects
 */
export const createLocalLearningObject = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const teacherId = req.user?.id;
    if (!teacherId) {
      res.status(401);
      throw new Error("Geen geldige teacher-gebruiker.");
    }

    const data: LocalLearningObjectData = req.body;
    // Eventuele extra validatie (bv. velden checken) kan hier

    const createdLO = await LocalLearningObjectService.createLearningObject(teacherId, data);
    res.status(201).json({
      message: "Leerobject aangemaakt",
      learningObject: createdLO,
    });
  }
);

/**
 * Haal alle leerobjecten op van deze teacher.
 * GET /teacher/learningObjects
 */
export const getLocalLearningObjects = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const teacherId = req.user?.id;
    if (!teacherId) {
      res.status(401);
      throw new Error("Geen geldige teacher-gebruiker.");
    }

    const objects = await LocalLearningObjectService.getAllLearningObjectsByTeacher(teacherId);
    res.json(objects);
  }
);

/**
 * Haal één leerobject op.
 * GET /teacher/learningObjects/:id
 */
export const getLocalLearningObjectById = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const teacherId = req.user?.id;
    if (!teacherId) {
      res.status(401);
      throw new Error("Geen geldige teacher-gebruiker.");
    }

    const { id } = req.params;
    const found = await LocalLearningObjectService.getLearningObjectById(id);

    if (!found) {
      res.status(404);
      throw new Error("Leerobject niet gevonden");
    }

    // Check of deze teacher de eigenaar is
    if (found.creatorId !== teacherId) {
      res.status(403);
      throw new Error("Je bent niet de eigenaar van dit leerobject");
    }

    res.json(found);
  }
);

/**
 * Update een leerobject.
 * PUT /teacher/learningObjects/:id
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

    const updated = await LocalLearningObjectService.updateLearningObject(id, data);
    res.json({
      message: "Leerobject bijgewerkt",
      learningObject: updated,
    });
  }
);

/**
 * Verwijder een leerobject.
 * DELETE /teacher/learningObjects/:id
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
  }
);
