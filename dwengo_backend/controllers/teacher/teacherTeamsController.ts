import { Request, Response } from "express";
import {
    createTeamsInAssignment,
    getTeamsForAssignment,
    updateTeamsForAssignment,
    deleteTeamFromAssignment
} from "../../services/teacherTeamsService";

export const createTeamInAssignment = async (req: Request, res: Response) => {
    try {
        const { assignmentId } = req.params;
        const { teams } = req.body;  // An array of teams to be created

        const createdTeams = await createTeamsInAssignment(assignmentId, teams);
        res.status(201).json({ createdTeams });
    } catch (error) {
        res.status(500).json({ error: "Error creating teams in assignment." });
    }
};

export const getTeamsInAssignment = async (req: Request, res: Response) => {
    try {
        const { assignmentId } = req.params;
        const teams = await getTeamsForAssignment(assignmentId);
        res.status(200).json(teams);
    } catch (error) {
        res.status(500).json({ error: "Error fetching teams for assignment." });
    }
};

export const updateTeamsInAssignment = async (req: Request, res: Response) => {
    try {
        const { assignmentId } = req.params;
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
