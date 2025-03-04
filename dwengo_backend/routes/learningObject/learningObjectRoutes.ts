import express from "express";
import {
  getAllLearningObjectsController,
  getLearningObjectController,
  searchLearningObjectsController,
  getLearningObjectsForPathController,
} from "../../controllers/learningObject/learningObjectController";
import { protectAnyUser } from "../../middleware/authAnyUserMiddleware";

const router = express.Router();

// Bescherm alle endpoints zodat een user (met role) aanwezig is.
router.use(protectAnyUser);

// GET /learningObjects – Haal alle leerobjecten op.
router.get("/", getAllLearningObjectsController);

// GET /learningObjects/search?q=blabla – Zoek leerobjecten.
router.get("/search", searchLearningObjectsController);

// GET /learningObjects/path/:pathId – Haal leerobjecten op voor een specifiek leerpad.
router.get("/path/:pathId", getLearningObjectsForPathController);

// GET /learningObjects/:id – Haal een specifiek leerobject op.
router.get("/:id", getLearningObjectController);

export default router;

