import { Response } from "express";
import asyncHandler from "express-async-handler";
import LocalLearningObjectService, {
  LocalLearningObjectData,
} from "../../services/localLearningObjectService";
import { AuthenticatedRequest } from "../../interfaces/extendedTypeInterfaces";
import { getTeacherFromAuthRequest } from "../../helpers/getUserFromAuthRequest";
import { LearningObject } from "@prisma/client";
import { AccesDeniedError } from "../../errors/errors";

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
    const found: LearningObject =
      await LocalLearningObjectService.getLearningObjectById(id);

    // Check of deze teacher de eigenaar is
    checkIfTeacherIsCreator(teacherId, found.creatorId);

    res.json(found);
  },
);

/**
 * Update een leerobject.
 */
export const updateLocalLearningObject = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const teacherId = getTeacherFromAuthRequest(req).id;

    const { id } = req.params;
    const data: Partial<LocalLearningObjectData> = req.body;

    // Check of leerobject bestaat en van deze teacher is
    const existing = await LocalLearningObjectService.getLearningObjectById(id);

    checkIfTeacherIsCreator(teacherId, existing.creatorId);

    const updated = await LocalLearningObjectService.updateLearningObject(
      id,
      data,
    );
    res.json({
      message: "Learning object successfully updated.",
      learningObject: updated,
    });
  },
);

/**
 * Verwijder een leerobject.
 */
export const deleteLocalLearningObject = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const teacherId = getTeacherFromAuthRequest(req).id;

    const { id } = req.params;
    const existing = await LocalLearningObjectService.getLearningObjectById(id);

    checkIfTeacherIsCreator(teacherId, existing.creatorId);
    await LocalLearningObjectService.deleteLearningObject(id);
    res.json({ message: "Learning object successfully deleted." });
  },
);

/**
 * Check if a teacher is the creator of a learning object.
 */
const checkIfTeacherIsCreator = function (
  teacherId: number,
  loCreatorId: number,
) {
  if (teacherId !== loCreatorId) {
    throw new AccesDeniedError(
      "Teacher is not the creator of this learning object.",
    );
  }
};
