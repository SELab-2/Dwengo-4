import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { AuthenticatedRequest } from "../../interfaces/extendedTypeInterfaces";
import LocalLearningPathService from "../../services/localLearningPathService";

/**
 * POST /teacher/learningPaths
 *   -> nieuw leerpad (zonder nodes)
 */
export const createLocalLearningPath = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    // We gaan ervan uit dat protectAnyUser al checkt of ingelogd, maar we doen extra check:
    const teacherId = req.user?.id;
    if (!teacherId || req.user?.role !== "TEACHER") {
      res.status(403);
      throw new Error("Alleen leerkrachten kunnen leerpaden aanmaken.");
    }

    const { title, language, description, image } = req.body;
    if (!title || !language) {
      res.status(400);
      throw new Error("Vereiste velden: title, language (optioneel: description, image).");
    }

    const newPath = await LocalLearningPathService.createLearningPath(teacherId, {
      title,
      language,
      description: description || "",
      image: image || null,
    });

    res.status(201).json({
      message: "Leerpad aangemaakt",
      learningPath: newPath,
    });
  }
);

/**
 * GET /teacher/learningPaths
 */
export const getLocalLearningPaths = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const teacherId = req.user?.id;
    if (!teacherId || req.user?.role !== "TEACHER") {
      res.status(403);
      throw new Error("Alleen leerkrachten kunnen hun leerpaden opvragen.");
    }

    const paths = await LocalLearningPathService.getAllLearningPathsByTeacher(teacherId);
    res.json(paths);
  }
);

/**
 * GET /teacher/learningPaths/:pathId
 */
export const getLocalLearningPathById = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const teacherId = req.user?.id;
    if (!teacherId || req.user?.role !== "TEACHER") {
      res.status(403);
      throw new Error("Niet geautoriseerd.");
    }

    const { pathId } = req.params;
    const path = await LocalLearningPathService.getLearningPathById(pathId);
    if (!path) {
      res.status(404);
      throw new Error("Leerpad niet gevonden");
    }
    if (path.creatorId !== teacherId) {
      res.status(403);
      throw new Error("Je bent niet de eigenaar van dit leerpad.");
    }

    res.json(path);
  }
);

/**
 * PUT /teacher/learningPaths/:pathId
 */
export const updateLocalLearningPath = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const teacherId = req.user?.id;
    if (!teacherId || req.user?.role !== "TEACHER") {
      res.status(403);
      throw new Error("Niet geautoriseerd.");
    }

    const { pathId } = req.params;
    const existingPath = await LocalLearningPathService.getLearningPathById(pathId);
    if (!existingPath) {
      res.status(404);
      throw new Error("Leerpad niet gevonden");
    }
    if (existingPath.creatorId !== teacherId) {
      res.status(403);
      throw new Error("Je bent niet de eigenaar van dit leerpad.");
    }

    const { title, language, description, image } = req.body;

    const updatedPath = await LocalLearningPathService.updateLearningPath(pathId, {
      title,
      language,
      description,
      image,
    });

    res.json({
      message: "Leerpad bijgewerkt",
      learningPath: updatedPath,
    });
  }
);

/**
 * DELETE /teacher/learningPaths/:pathId
 */
export const deleteLocalLearningPath = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const teacherId = req.user?.id;
    if (!teacherId || req.user?.role !== "TEACHER") {
      res.status(403);
      throw new Error("Niet geautoriseerd.");
    }

    const { pathId } = req.params;
    const existingPath = await LocalLearningPathService.getLearningPathById(pathId);
    if (!existingPath) {
      res.status(404);
      throw new Error("Leerpad niet gevonden");
    }
    if (existingPath.creatorId !== teacherId) {
      res.status(403);
      throw new Error("Je bent niet de eigenaar van dit leerpad.");
    }

    await LocalLearningPathService.deleteLearningPath(pathId);
    res.json({ message: "Leerpad verwijderd" });
  }
);
