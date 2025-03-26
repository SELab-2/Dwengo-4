import {Response} from "express";
import asyncHandler from "express-async-handler";
import {AuthenticatedRequest} from "../../interfaces/extendedTypeInterfaces";
import LocalLearningPathService from "../../services/localLearningPathService";
import {LearningPath} from "@prisma/client";

// Een interface om je body te structureren.
// Je kunt er bijvoorbeeld nog meer velden in opnemen, afhankelijk van je noden.
interface PathMetadata {
  title: string;
  language: string;
  description?: string;
  image?: string | null;
}

/**
 * POST /teacher/learningPaths
 *   -> nieuw leerpad (zonder nodes)
 */
export const createLocalLearningPath = asyncHandler(
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    // Door protectTeacher in de routes weten we: role=TEACHER
    const teacherId: number = req.user!.id; // null-check niet nodig

    const { title, language, description, image } = req.body as PathMetadata;
    if (!title || !language) {
      res.status(400);
      throw new Error("Vereiste velden: title, language (optioneel: description, image).");
    }

    const newPath: LearningPath = await LocalLearningPathService.createLearningPath(teacherId, {
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
 *   -> haal alle leerpaden op van de ingelogde teacher
 */
export const getLocalLearningPaths = asyncHandler(
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const teacherId: number = req.user!.id;

    const paths: LearningPath[] = await LocalLearningPathService.getAllLearningPathsByTeacher(teacherId);
    res.json(paths);
  }
);

/**
 * GET /teacher/learningPaths/:pathId
 *   -> haal één leerpad op
 */
export const getLocalLearningPathById = asyncHandler(
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const teacherId: number = req.user!.id;

    const { pathId } = req.params;
    const path: LearningPath | null = await LocalLearningPathService.getLearningPathById(pathId);
    if (!path) {
      res.status(404);
      throw new Error("Leerpad niet gevonden");
    }
    // Domein-check: Is dit path van deze teacher?
    if (path.creatorId !== teacherId) {
      res.status(403);
      throw new Error("Je bent niet de eigenaar van dit leerpad.");
    }

    res.json(path);
  }
);

/**
 * PATCH /teacher/learningPaths/:pathId
 *   -> Update (gedeeltelijk) een leerpad
 */
export const updateLocalLearningPath = asyncHandler(
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {

    const { pathId, existingPath } = await getAndValidateLearningPathById(req, res);

    // Hier kun je gedeeltelijk updaten
    const { title, language, description, image } = req.body as Partial<PathMetadata>;

    const updatedPath: LearningPath = await LocalLearningPathService.updateLearningPath(pathId, {
      title: title !== undefined ? title : existingPath.title,
      language: language !== undefined ? language : existingPath.language,
      description: description !== undefined ? description : existingPath.description,
      image: image !== undefined ? image : existingPath.image || null,
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
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { pathId } = await getAndValidateLearningPathById(req, res);

    await LocalLearningPathService.deleteLearningPath(pathId);
    res.json({ message: "Leerpad verwijderd" });
  }
);

async function getAndValidateLearningPathById(req: AuthenticatedRequest, res: Response): Promise<{pathId: string, existingPath: LearningPath}> {
    const teacherId: number = req.user!.id;

    const {pathId} = req.params;
    const existingPath: LearningPath | null = await LocalLearningPathService.getLearningPathById(pathId);
    if (!existingPath) {
        res.status(404);
        throw new Error("Leerpad niet gevonden");
    }
    if (existingPath.creatorId !== teacherId) {
        res.status(403);
        throw new Error("Je bent niet de eigenaar van dit leerpad.");
    }

    return {pathId: pathId, existingPath: existingPath};
}
