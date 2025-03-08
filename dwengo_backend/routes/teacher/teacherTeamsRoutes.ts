import express, {Router} from "express";
import {
    createTeamInAssignment,
    getTeamsInAssignment,
    updateTeamsInAssignment,
    deleteTeamInAssignment
} from "../../controllers/teacher/teacherTeamsController";
import {
    makeAssignmentIdParamValid,
    makeTeamIdParamValid,
    makeTeamsParamValid
} from "../../middleware/teamValidationMiddleware";
import {protectTeacher} from "../../middleware/teacherAuthMiddleware";

const router: Router = express.Router();

// Route to create teams in an assignment
router.post("/", protectTeacher, makeAssignmentIdParamValid, makeTeamsParamValid, createTeamInAssignment);

// Route to get all teams in an assignment
router.get("/", protectTeacher, makeAssignmentIdParamValid, getTeamsInAssignment);

// Route to update teams in an assignment
router.put("/", protectTeacher, makeAssignmentIdParamValid, updateTeamsInAssignment);

// Route to delete a team in an assignment
router.delete("/:teamId", protectTeacher, makeTeamIdParamValid, deleteTeamInAssignment);

export default router;
