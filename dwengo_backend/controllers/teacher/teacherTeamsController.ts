import { Request, Response } from "express";
import {
    createTeamsInAssignment,
    getTeamsThatHaveAssignment,
    updateTeamsForAssignment,
    deleteTeamFromAssignment
} from "../../services/teacherTeamsService";

// Validate that the assignmentId is a valid number
const isAssignmentIdValid = (req: Request, res: Response): boolean => {
    const id = Number(req.params.assignmentId);
    return !isNaN(id);
};

export const createTeamInAssignment = async (req: Request, res: Response) => {
    try {
        // This is guaranteed to be possible by "makeAssignmentIdParamValid" in middleware/teamValidationMiddleware.ts
        const assignmentId = Number(req.params.assignmentId);
        const { teams } = req.body;  // An array of teams to be created

        const createdTeams = await createTeamsInAssignment(assignmentId, teams);
        res.status(201).json({ createdTeams });
    } catch (error) {
        res.status(500).json({ error: "Error creating teams in assignment." });
    }
};

export const getTeamsInAssignment = async (req: Request, res: Response) => {
    try {
        const assignmentId = Number(req.params.assignmentId);
        if (isNaN(assignmentId)) {
            return res.status(400).json({ error: "Invalid assignment ID." });
        }
        const teams = await getTeamsThatHaveAssignment(assignmentId);
        res.status(200).json(teams);
    } catch (error) {
        res.status(500).json({ error: "Error fetching teams for assignment." });
    }
};

export const updateTeamsInAssignment = async (req: Request, res: Response) => {
    try {
        const assignmentId = Number(req.params.assignmentId);
        if (isNaN(assignmentId)) {
            return res.status(400).json({ error: "Invalid assignment ID." });
        }
        const { teams } = req.body;  // An array of updated teams

        const updatedTeams = await updateTeamsForAssignment(assignmentId, teams);
        res.status(200).json(updatedTeams);
    } catch (error) {
        res.status(500).json({ error: "Error updating teams for assignment." });
    }
};

export const deleteTeamInAssignment = async (req: Request, res: Response) => {
    try {
        const { assignmentId, teamId } = req.params;

        await deleteTeamFromAssignment(assignmentId, teamId);
        res.status(200).json({ message: "Team successfully deleted." });
    } catch (error) {
        res.status(500).json({ error: "Error deleting team from assignment." });
    }
};
