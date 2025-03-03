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
 * We beschermen alle endpoints zodat je zeker user-rol hebt.
 * (Je kunt natuurlijk per endpoint bepalen of die publiek of
 *  alleen teacher of teacher+student is.)
 */
router.use(protectAnyUser);

router.get("/", getAllLearningObjects);          
router.get("/search", searchLearningObjects);    // GET /learningObjects/search?q=...
router.get("/path/:pathId", getLearningObjectsForPath); 
router.get("/:id", getLearningObject);           

export default router;
