import express from "express";
import {
    createTeamInAssignment,
    getTeamsInAssignment,
    updateTeamsInAssignment,
    deleteTeamInAssignment
} from "../../controllers/teacher/teacherTeamsController";
import {makeAssignmentIdParamValid, makeTeamsParamValid} from "../../middleware/teamValidationMiddleware";

const router = express.Router();

// Route to create teams in an assignment
router.post("/:assignmentId", makeAssignmentIdParamValid, makeTeamsParamValid, createTeamInAssignment);

// Route to get all teams in an assignment
router.get("/:assignmentId", getTeamsInAssignment);

// Route to update teams in an assignment
router.put("/:assignmentId", updateTeamsInAssignment);

// Route to delete a team in an assignment
router.delete("/:assignmentId/:teamId", deleteTeamInAssignment);

export default router;
