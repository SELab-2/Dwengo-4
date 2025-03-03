import express from "express";
import { searchLearningPaths, getLearningPathById } from "../../controllers/learningPath/learningPathController";
import { protectAnyUser } from "../../middleware/authAnyUserMiddleware";

const router = express.Router();

// We beschermen de endpoints zodat enkel ingelogde gebruikers (student/teacher/admin) 
// leerpaden kunnen doorzoeken. Wil je het openbaar? Dan kun je protectAnyUser weglaten.
router.use(protectAnyUser);

// GET /learningPaths?language=nl&hruid=...&title=...&description=...&all=
router.get("/", searchLearningPaths);

// GET /learningPaths/:pathId  (zoekt in Dwengo-API op _id of hruid)
router.get("/:pathId", getLearningPathById);

export default router;
