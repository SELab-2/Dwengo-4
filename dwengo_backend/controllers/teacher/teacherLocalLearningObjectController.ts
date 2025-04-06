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
 * POST /learningObjectByTeacher
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
 * GET /learningObjectByTeacher
 */
export const getLocalLearningObjects = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const teacherId = getUserFromAuthRequest(req).id;

    const objects =
      await LocalLearningObjectService.getAllLearningObjectsByTeacher(
        teacherId,
      );
    res.status(200).json({ objects });
  },
);

/**
 * Haal één leerobject op.
 * GET /learningObjectByTeacher/:createdLearningObjectId
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

    res.status(200).json({ learningObject: found });
  },
);

/**
 * Update een leerobject.
 * PUT /learningObjectByTeacher/:createdLearningObjectId
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
    res.status(200).json({
      message: "Leerobject bijgewerkt",
      learningObject: updated,
    });
  },
);

/**
 * Verwijder een leerobject.
 * DELETE /learningObjectByTeacher/:createdLearningObjectId
 */
export const deleteLocalLearningObject = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const teacherId = getUserFromAuthRequest(req).id;

    const { createdLearningObjectId } = req.params;
    const existing = await LocalLearningObjectService.getLearningObjectById(
      createdLearningObjectId,
    );
    if (!existing) {
      throw new NotFoundError("Learning object not found");
    }
    if (existing.creatorId !== teacherId) {
      throw new AccesDeniedError("Je bent niet de eigenaar van dit leerobject");
    }

    await LocalLearningObjectService.deleteLearningObject(
      createdLearningObjectId,
    );
    res.status(200).json({ message: "Learning object deleted" });
  },
);
