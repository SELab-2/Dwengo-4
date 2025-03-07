import express from "express";
import {
  getAllLearningObjectsController,
  getLearningObjectController,
  searchLearningObjectsController,
  getLearningObjectsForPathController,
} from "../../controllers/learningObject/learningObjectController";
import { protectAnyUser } from "../../middleware/authAnyUserMiddleware";

const router = express.Router();

// Bescherm alle endpoints, user moet ingelogd zijn (student/teacher/admin)
router.use(protectAnyUser);

router.get("/", getAllLearningObjectsController);
router.get("/search", searchLearningObjectsController);
router.get("/path/:pathId", getLearningObjectsForPathController);
router.get("/:id", getLearningObjectController);

export default router;
