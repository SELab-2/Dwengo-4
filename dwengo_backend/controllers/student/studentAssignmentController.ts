import { Request, Response } from "express";
import { getAssignmentsForStudent, getAssignmentsWithClosestDeadlines } from "../../services/studentAssignmentService";

export const getStudentAssignments = async (req: Request & { user: { id: number } }, res: Response) => {
    try {
        const studentId = req.user.id;
        const assignments = await getAssignmentsForStudent(studentId);
        res.status(200).json(assignments);
    } catch (error) {
        res.status(500).json({ error: "Er is iets misgegaan bij het ophalen van de taken." });
    }
};

export const getClosestDeadlines = async (req: Request & { user: { id: number } }, res: Response) => {
    try {
        const studentId = req.user.id;
        const limit = Number(req.query.limit) || 5; // Standaard 5 taken ophalen
        const assignments = await getAssignmentsWithClosestDeadlines(studentId, limit);
        res.status(200).json(assignments);
    } catch (error) {
        res.status(500).json({ error: "Er is iets misgegaan bij het ophalen van de taken met dichtsbijzijnde deadline." });
    }
};
