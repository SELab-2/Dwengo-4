import express from "express";
import controller from "../../controllers/teacher/feedbackController";

const router = express.Router();

router.get('/', controller.getAllFeedback);



export default router;
