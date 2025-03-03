import express from "express";
import {
  getAllLearningObjects,
  getLearningObject,
  searchLearningObjects,
  getLearningObjectsForPath,
} from "../../controllers/learningObject/learningObjectController";
import { protectAnyUser } from "../../middleware/authAnyUserMiddleware";

const router = express.Router();

/**
 * Bescherm alle endpoints zodat je zeker een user-rol hebt.
 */
router.use(protectAnyUser);

// GET /learningObjects
router.get("/", getAllLearningObjects);

// GET /learningObjects/search?q=...
router.get("/search", searchLearningObjects);

// GET /learningObjects/path/:pathId
// pathId is string (bv. "67b4488c9dadb305c41043cc")
router.get("/path/:pathId", getLearningObjectsForPath);

// GET /learningObjects/:id
router.get("/:id", getLearningObject);

export default router;

