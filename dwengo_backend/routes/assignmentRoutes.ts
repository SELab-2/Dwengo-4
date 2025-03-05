import express, {Router} from 'express';
import {AssignmentController} from "../controllers/assignmentController";

const router: Router = express.Router();
const controller = new AssignmentController();

router.get("/assignments/:assignmentId", controller.getAssignmentsById);

export default router;
