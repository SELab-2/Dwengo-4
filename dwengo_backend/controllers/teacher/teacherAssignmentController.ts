import { Request, Response } from "express";
import * as assignmentService from "../../services/teacherAssignmentService";

export class AssignmentTeacherController {
    async createAssignmentForClass(req: Request, res: Response) {
        try {
            const { teacherId, classId, learningPathId } = req.body;
            const assignment = await assignmentService.createAssignmentForClass(teacherId, classId, learningPathId);
            res.status(201).json(assignment);
        } catch (error) {
            res.status(500).json({ error: "Failed to create assignment" });
        }
    }

    async getAssignmentsByClass(req: Request, res: Response) {
        try {
            const classId = parseInt(req.params.classId);
            const assignments = await assignmentService.getAssignmentsByClass(classId);
            res.status(200).json(assignments);
        } catch (error) {
            res.status(500).json({ error: "Failed to retrieve assignments" });
        }
    }

    async updateAssignment(req: Request, res: Response) {
        try {
            const assignmentId = parseInt(req.params.assignmentId);
            const { learningPathId } = req.body;
            const updatedAssignment = await assignmentService.updateAssignment(assignmentId, learningPathId);
            res.json(updatedAssignment);
        } catch (error) {
            res.status(500).json({ error: "Failed to update assignment" });
        }
    }

    async deleteAssignment(req: Request, res: Response) {
        try {
            const assignmentId = parseInt(req.params.assignmentId);
            await assignmentService.deleteAssignment(assignmentId);
            res.status(204).send();
        } catch (error) {
            res.status(500).json({ error: "Failed to delete assignment" });
        }
    }
}
