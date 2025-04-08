import { Response } from "express";
import asyncHandler from "express-async-handler";
import { AuthenticatedRequest } from "../../interfaces/extendedTypeInterfaces";
import LocalLearningPathService from "../../services/localLearningPathService";
import { BadRequestError } from "../../errors/errors";
import { getUserFromAuthRequest } from "../../helpers/getUserFromAuthRequest";

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
  async (req: AuthenticatedRequest, res: Response) => {
    // Door protectTeacher in de routes weten we: role=TEACHER
    const teacherId = getUserFromAuthRequest(req).id;

    if (!req.body.title || !req.body.language) {
      res.status(400);
      throw new BadRequestError("Title and language are required fields.");
    }

    const { title, language, description, image } = req.body as PathMetadata;

    const newPath = await LocalLearningPathService.createLearningPath(
      teacherId,
      {
        title,
        language,
        description: description || "",
        image: image || null,
      },
    );

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
    const teacherId = req.user!.id;

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
    const teacherId = req.user!.id;

    const { pathId } = req.params;
    const path = await LocalLearningPathService.getLearningPathById(pathId);
    // Domein-check: Is dit path van deze teacher?
    if (path.creatorId !== teacherId) {
      res.status(403);
      throw new Error("Je bent niet de eigenaar van dit leerpad.");
    }

    res.json(path);
  },
);

/**
 * PATCH /teacher/learningPaths/:pathId
 *   -> Update (gedeeltelijk) een leerpad
 */
export const updateLocalLearningPath = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const teacherId = req.user!.id;

    const { pathId } = req.params;
    const existingPath =
      await LocalLearningPathService.getLearningPathById(pathId);
    if (existingPath.creatorId !== teacherId) {
      res.status(403);
      throw new Error("Je bent niet de eigenaar van dit leerpad.");
    }

    // Hier kun je gedeeltelijk updaten
    const { title, language, description, image } =
      req.body as Partial<PathMetadata>;

    const updatedPath = await LocalLearningPathService.updateLearningPath(
      pathId,
      {
        title: title !== undefined ? title : existingPath.title,
        language: language !== undefined ? language : existingPath.language,
        description:
          description !== undefined ? description : existingPath.description,
        image: image !== undefined ? image : existingPath.image || null,
      },
    );

    res.json({
      message: "Leerpad bijgewerkt",
      learningPath: updatedPath,
    });
  },
);

/**
 * DELETE /teacher/learningPaths/:pathId
 */
export const deleteLocalLearningPath = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const teacherId = req.user!.id;

    const { pathId } = req.params;
    const existingPath =
      await LocalLearningPathService.getLearningPathById(pathId);
    if (existingPath.creatorId !== teacherId) {
      res.status(403);
      throw new Error("Je bent niet de eigenaar van dit leerpad.");
    }

    await LocalLearningPathService.deleteLearningPath(pathId);
    res.json({ message: "Leerpad verwijderd" });
  },
);
