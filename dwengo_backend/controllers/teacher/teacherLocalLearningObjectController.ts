import { Response } from "express";
import asyncHandler from "express-async-handler";
import LocalLearningObjectService, {
  LocalLearningObjectData,
} from "../../services/localLearningObjectService";
import { AuthenticatedRequest } from "../../interfaces/extendedTypeInterfaces";
import { getUserFromAuthRequest } from "../../helpers/getUserFromAuthRequest";
import { AccesDeniedError, NotFoundError } from "../../errors/errors";

/**
 * Maak een nieuw leerobject.
 * POST /teacher/learningObjects
 */
export const createLocalLearningObject = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const teacherId = getUserFromAuthRequest(req).id;

    const data: LocalLearningObjectData = req.body;
    // Eventuele extra validatie (bv. velden checken) kan hier

    const createdLO = await LocalLearningObjectService.createLearningObject(
      teacherId,
      data,
    );
    res.status(201).json({
      message: "Learning object created",
      learningObject: createdLO,
    });
  },
);

/**
 * Haal alle leerobjecten op van deze teacher.
 * GET /teacher/learningObjects
 */
export const getLocalLearningObjects = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const teacherId = getUserFromAuthRequest(req).id;

    const objects =
      await LocalLearningObjectService.getAllLearningObjectsByTeacher(
        teacherId,
      );
    res.json(objects);
  },
);

/**
 * Haal één leerobject op.
 * GET /teacher/learningObjects/:id
 */
export const getLocalLearningObjectById = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const teacherId = getUserFromAuthRequest(req).id;

    const { createdLearningObjectId } = req.params;
    const found = await LocalLearningObjectService.getLearningObjectById(
      createdLearningObjectId,
    );

    if (!found) {
      throw new NotFoundError("Leerobject niet gevonden");
    }

    // Check of deze teacher de eigenaar is
    if (found.creatorId !== teacherId) {
      throw new AccesDeniedError("Je bent niet de eigenaar van dit leerobject");
    }

    res.json(found);
  },
);

/**
 * Update een leerobject.
 * PUT /teacher/learningObjects/:id
 */
export const updateLocalLearningObject = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const teacherId = getUserFromAuthRequest(req).id;

    const { createdLearningObjectId } = req.params;
    const data: Partial<LocalLearningObjectData> = req.body;

    // Check of leerobject bestaat en van deze teacher is
    const existing = await LocalLearningObjectService.getLearningObjectById(
      createdLearningObjectId,
    );
    if (!existing) {
      throw new NotFoundError("Leerobject niet gevonden");
    }
    if (existing.creatorId !== teacherId) {
      throw new AccesDeniedError("Je bent niet de eigenaar van dit leerobject");
    }

    const updated = await LocalLearningObjectService.updateLearningObject(
      createdLearningObjectId,
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
 * DELETE /teacher/learningObjects/:id
 */
export const deleteLocalLearningObject = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const teacherId = getUserFromAuthRequest(req).id;

    const { createdLearningObjectId } = req.params;
    const existing = await LocalLearningObjectService.getLearningObjectById(
      createdLearningObjectId,
    );
    if (!existing) {
      throw new NotFoundError("Leerobject niet gevonden");
    }
    if (existing.creatorId !== teacherId) {
      throw new AccesDeniedError("Je bent niet de eigenaar van dit leerobject");
    }

    await LocalLearningObjectService.deleteLearningObject(
      createdLearningObjectId,
    );
    res.json({ message: "Leerobject verwijderd" });
  },
);
