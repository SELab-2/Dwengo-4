import { Request, Response } from "express";
import { getAssignmentsForStudent, getAssignmentsWithClosestDeadlines } from "../../services/studentAssignmentService";
import {Assignment} from "@prisma/client";

export const getStudentAssignments = async (req: Request, res: Response): Promise<void> => {
    try {
        const { studentId } = req.body;
        const assignments: Assignment[] = await getAssignmentsForStudent(studentId);
        res.status(200).json(assignments);
    } catch (error) {
        res.status(500).json({ error: "Er is iets misgegaan bij het ophalen van de taken." });
    }
};

export const getClosestDeadlines = async (req: Request, res: Response): Promise<void> => {
    try {
        const { studentId } = req.body;
        // Get the 5 most urgent task unless specified otherwise
        const limit: number = Number(req.query.limit) || 5;
        const assignments: Assignment[] = await getAssignmentsWithClosestDeadlines(studentId, limit);
        res.status(200).json(assignments);
    } catch (error) {
        res.status(500).json({ error: "Er is iets misgegaan bij het ophalen van de taken met dichtsbijzijnde deadline." });
    }
};
