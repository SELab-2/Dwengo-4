import { Response } from "express";
import asyncHandler from "express-async-handler";
import { AuthenticatedRequest } from "../../interfaces/extendedTypeInterfaces";
import LocalLearningPathService, {
  LocalLearningPathData,
} from "../../services/localLearningPathService";
import { getUserFromAuthRequest } from "../../helpers/getUserFromAuthRequest";
import { checkIfTeacherIsCreator, Property } from "./teacherChecks";

/**
 * POST /teacher/learningPaths
 *   -> nieuw leerpad
 */
export const createLocalLearningPath = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    // Door protectTeacher in de routes weten we: role=TEACHER
    const teacherId: number = getUserFromAuthRequest(req).id;


    const { title, language, description, image, nodes } =
      req.body as LocalLearningPathData;


    console.log("LEERPAD MAKEN")
    console.log("LEERPAD MAKEN")
    console.log("LEERPAD MAKEN")
    console.log("LEERPAD MAKEN")
    console.log(nodes);

    const newPath = await LocalLearningPathService.createLearningPath(teacherId, {
      title: title,
      language: language,
      description: description !== undefined ? description : "",
      image: image !== undefined ? image : null,
      nodes: nodes !== undefined ? nodes : [],
    });

    res.status(201).json({
      message: "Learning path successfully created.",
      learningPath: newPath,
    });
  },
);

/**
 * GET /teacher/learningPaths
 *   -> haal alle leerpaden op van de ingelogde teacher
 */
export const getLocalLearningPaths = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const teacherId: number = getUserFromAuthRequest(req).id;

    const paths =
      await LocalLearningPathService.getAllLearningPathsByTeacher(teacherId);
    res.json(paths);
  },
);

/**
 * GET /teacher/learningPaths/:pathId
 *   -> haal één leerpad op
 */
export const getLocalLearningPathById = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const teacherId: number = getUserFromAuthRequest(req).id;

    const { pathId } = req.params;
    const path = await LocalLearningPathService.getLearningPathById(pathId);
    // Domein-check: Is dit path van deze teacher?
    checkIfTeacherIsCreator(teacherId, path.creatorId, Property.LearningPath);

    res.json(path);
  },
);

/**
 * PATCH /teacher/learningPaths/:pathId
 *   -> Update (gedeeltelijk) een leerpad
 */
export const updateLocalLearningPath = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const teacherId = getUserFromAuthRequest(req).id;
    const { pathId } = req.params;

    const existingPath = await LocalLearningPathService.getLearningPathById(pathId);
    checkIfTeacherIsCreator(
      teacherId,
      existingPath.creatorId,
      Property.LearningPath,
    );

    // any of these can be undefined
    const { title, language, description, image, nodes } =
      req.body as Partial<LocalLearningPathData>;

    const updatedPath = await LocalLearningPathService.updateLearningPath(pathId, {
      title: title !== undefined ? title : existingPath.title,
      language: language !== undefined ? language : existingPath.language,
      description:
        description !== undefined ? description : existingPath.description,
      image: image !== undefined ? image : existingPath.image || null,
      nodes: nodes,
    });

    res.json({
      message: "Learning path successfully updated.",
      learningPath: updatedPath,
    });
  },
);

/**
 * DELETE /teacher/learningPaths/:pathId
 */
export const deleteLocalLearningPath = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const teacherId = getUserFromAuthRequest(req).id;

    const { pathId } = req.params;
    const existingPath = await LocalLearningPathService.getLearningPathById(pathId);
    checkIfTeacherIsCreator(
      teacherId,
      existingPath.creatorId,
      Property.LearningPath,
    );

    await LocalLearningPathService.deleteLearningPath(pathId);
    res.status(204).end();
  },
);

export const deleteAllLocalLearningPaths = asyncHandler(
  async (req, res) => {
    const teacherId = getUserFromAuthRequest(req).id;

    await LocalLearningPathService.deleteAllLearningPathsForTeacher(
      teacherId
    );

    res.status(204).end();
  }
);