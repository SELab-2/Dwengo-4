import { Response } from "express";
import asyncHandler from "express-async-handler";
import LocalLearningObjectService, {
  LocalLearningObjectData,
} from "../../services/localLearningObjectService";
import { AuthenticatedRequest } from "../../interfaces/extendedTypeInterfaces";
import { LearningObject } from "@prisma/client";
import { getUserFromAuthRequest } from "../../helpers/getUserFromAuthRequest";
import { Property, checkIfTeacherIsCreator } from "./teacherChecks";

/**
 * Maak een nieuw leerobject.
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
      message: "Learning object successfully created.",
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
    const found: LearningObject =
      await LocalLearningObjectService.getLearningObjectById(
        createdLearningObjectId,
      );

    // Check of deze teacher de eigenaar is
    checkIfTeacherIsCreator(
      teacherId,
      found.creatorId,
      Property.LearningObject,
    );

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

    checkIfTeacherIsCreator(
      teacherId,
      existing.creatorId,
      Property.LearningObject,
    );

    const updated = await LocalLearningObjectService.updateLearningObject(
      createdLearningObjectId,
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
 * DELETE /learningObjectByTeacher/:createdLearningObjectId
 */
export const deleteLocalLearningObject = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const teacherId = getUserFromAuthRequest(req).id;

    const { createdLearningObjectId } = req.params;
    const existing = await LocalLearningObjectService.getLearningObjectById(
      createdLearningObjectId,
    );

    checkIfTeacherIsCreator(
      teacherId,
      existing.creatorId,
      Property.LearningObject,
    );
    await LocalLearningObjectService.deleteLearningObject(
      createdLearningObjectId,
    );
    res.status(204).end();
  },
);
