import { Response } from "express";
import asyncHandler from "express-async-handler";
import { AuthenticatedRequest } from "../../interfaces/extendedTypeInterfaces";
import LocalLearningPathService from "../../services/localLearningPathService";
import { getUserFromAuthRequest } from "../../helpers/getUserFromAuthRequest";
import { AccesDeniedError, NotFoundError } from "../../errors/errors";

// Een interface om je body te structureren.
// Je kunt er bijvoorbeeld nog meer velden in opnemen, afhankelijk van je noden.
interface PathMetadata {
  title: string;
  language: string;
  description?: string;
  image?: string | null;
}

// De leerkracht maak een nieuwe leerpad aan
export const createLocalLearningPath = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    // Door protectTeacher in de routes weten we: role=TEACHER
    const teacherId = getUserFromAuthRequest(req).id;

    const { title, language, description, image } = req.body as PathMetadata;
    if (!title || !language) {
      res.status(400);
      throw new Error(
        "Vereiste velden: title, language (optioneel: description, image).",
      );
    }

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
      message: "Leerpad aangemaakt",
      learningPath: newPath,
    });
  },
);

// haal alle leerpaden op van de ingelogde teacher
export const getLocalLearningPaths = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const teacherId = getUserFromAuthRequest(req).id;

    const paths =
      await LocalLearningPathService.getAllLearningPathsByTeacher(teacherId);
    res.json(paths);
  },
);

// haal één leerpad op
export const getLocalLearningPathById = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const teacherId = getUserFromAuthRequest(req).id;

    const { pathId } = req.params;
    const path = await LocalLearningPathService.getLearningPathById(pathId);
    if (!path) {
      throw new NotFoundError("Leerpad niet gevonden");
    }
    // Domein-check: Is dit path van deze teacher?
    if (path.creatorId !== teacherId) {
      throw new AccesDeniedError("Je bent niet de eigenaar van dit leerpad.");
    }

    res.json(path);
  },
);

// Update (gedeeltelijk) een leerpad
export const updateLocalLearningPath = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const teacherId = getUserFromAuthRequest(req).id;

    const { pathId } = req.params;
    const existingPath =
      await LocalLearningPathService.getLearningPathById(pathId);
    if (!existingPath) {
      throw new NotFoundError("Leerpad niet gevonden");
    }
    if (existingPath.creatorId !== teacherId) {
      throw new AccesDeniedError("Je bent niet de eigenaar van dit leerpad.");
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

// Verwijder een leerpad
export const deleteLocalLearningPath = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const teacherId = getUserFromAuthRequest(req).id;

    const { pathId } = req.params;
    const existingPath =
      await LocalLearningPathService.getLearningPathById(pathId);
    if (!existingPath) {
      throw new NotFoundError("Leerpad niet gevonden");
    }
    if (existingPath.creatorId !== teacherId) {
      throw new AccesDeniedError("Je bent niet de eigenaar van dit leerpad.");
    }

    await LocalLearningPathService.deleteLearningPath(pathId);
    res.json({ message: "Leerpad verwijderd" });
  },
);
