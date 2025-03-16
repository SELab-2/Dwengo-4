import express, { Router } from "express";
import { 
    getStudentTeams, 
    getTeamByAssignment, 
    getTeamMembers 
} from "../../controllers/student/studentTeamController";
import { protectStudent } from "../../middleware/studentAuthMiddleware";

const router: Router = express.Router();

// Haal alle teams op waarin de ingelogde student zit
router.get("/", protectStudent, getStudentTeams);

// Haal een specifiek team op aan de hand van assignmentId
router.get("/:assignmentId", protectStudent, getTeamByAssignment);

// Haal alle teamleden op van een specifiek team
router.get("/:teamId/members", protectStudent, getTeamMembers);

export default router;
