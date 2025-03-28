import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { AuthenticatedRequest } from "../../interfaces/extendedTypeInterfaces";
import LocalLearningPathService from "../../services/localLearningPathService";
import { getLocalLearningPaths } from "./teacherLocalLearningPathController";
import { searchLearningPathsController } from "../learningPath/learningPathController";
import { searchLearningPaths } from "../../services/learningPathService";

// Een interface om je body te structureren.
// Je kunt er bijvoorbeeld nog meer velden in opnemen, afhankelijk van je noden.
interface PathMetadata {
    title: string;
    language: string;
    description?: string;
    image?: string | null;
}

/**
 * GET /teacher/allLearningPaths
 * Gets both local and API learning paths
 */
export const getAllLearningPaths = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
        try {
            // Get local learning paths for the teacher
            const teacherId = req.user!.id;
            const localPaths = await LocalLearningPathService.getAllLearningPathsByTeacher(teacherId);

            // Get all learning paths from API
            const apiPaths = await searchLearningPaths({ all: '' });

            // Combine local and API paths into a single array
            const combinedPaths = [...localPaths, ...apiPaths];
            
            // Return combined results
            res.json(combinedPaths);
        } catch (error) {
            res.status(500);
            throw new Error("Failed to fetch learning paths: " + error);
        }
    }
);

