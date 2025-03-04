import express from "express";
import controller from "../../controllers/teacher/feedbackController";

const router = express.Router();

router.get('/:evaluationId', controller.getAllFeedbackForEvaluation);



export default router;
