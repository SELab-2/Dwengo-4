import { Request, Response } from "express";
import teacherAssignmentService from "../../services/teacherAssignmentService";

export class AssignmentTeacherController {
    async createAssignmentForClass(req: Request, res: Response) {
        try {
            const { teacherId, classId, learningPathId } = req.body;
            const assignment = await teacherAssignmentService.createAssignmentForClass(teacherId, classId, learningPathId);
            res.status(201).json(assignment);
        } catch (error) {
            res.status(500).json({ error: "Failed to create assignment" });
        }
    }

    async getAssignmentsByClass(req: Request, res: Response) {
        try {
            const classId: number = parseInt(req.params.classId);
            const { teacherId } = req.body;
            const assignments = await teacherAssignmentService.getAssignmentsByClass(classId, teacherId);
            res.status(200).json(assignments);
        } catch (error) {
            res.status(500).json({ error: "Failed to retrieve assignments" });
        }
    }

    async updateAssignment(req: Request, res: Response) {
        try {
            const assignmentId: number = parseInt(req.params.assignmentId);
            const { learningPathId, teacherId } = req.body;
            const updatedAssignment = await teacherAssignmentService.updateAssignment(assignmentId, learningPathId, teacherId);
            res.json(updatedAssignment);
        } catch (error) {
            res.status(500).json({ error: "Failed to update assignment" });
        }
    }

    async deleteAssignment(req: Request, res: Response) {
        try {
            const assignmentId: number = parseInt(req.params.assignmentId);
            const { teacherId } = req.body;
            await teacherAssignmentService.deleteAssignment(assignmentId, teacherId);
            res.status(204).send();
        } catch (error) {
            res.status(500).json({ error: "Failed to delete assignment" });
        }
    }
}
