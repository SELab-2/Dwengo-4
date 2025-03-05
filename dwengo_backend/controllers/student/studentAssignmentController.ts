import { Request, Response } from "express";
import { getAssignmentsForStudent } from "../../services/studentAssignmentService";
import {Assignment} from "@prisma/client";

export const getStudentAssignments = async (req: Request, res: Response): Promise<void> => {
    try {
        const { studentId } = req.body;

        // Een URL van volgend formaat wordt verwacht
        // GET /assignments?sort=deadline&order=desc&limit=5

        // Sorteer standaard de deadline, extra velden kunnen meegegeven worden
        const sortFields: string[] = (req.query.sort as string)?.split(",") || ["deadline"];
        // Sorteer standaard ascending, descending kan ook
        const order: "desc" | "asc" = req.query.order === "desc" ? "desc" : "asc";
        // Haal standaard 5 assignments op, andere hoeveelheden kunnen ook
        const limit: number = Number(req.query.limit) || 5;

        const assignments: Assignment[] = await getAssignmentsForStudent(studentId, sortFields, order, limit);
        res.status(200).json(assignments);
    } catch (error) {
        res.status(500).json({ error: "Er is iets misgegaan bij het ophalen van de taken." });
    }
};
