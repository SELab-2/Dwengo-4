import { Response } from "express";
import { AuthenticatedRequest } from "../../interfaces/extendedTypeInterfaces";
import teacherAssignmentService from "../../services/teacherServices/teacherAssignmentService";

export class AssignmentTeacherController {
    async createAssignmentForClass(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const { classId, learningPathId, deadline }: { classId: number, learningPathId: number, deadline: string } = req.body;
            const teacherId: number = Number(req.user.id);

            const parsedDeadline = new Date(deadline);

            const assignment = await teacherAssignmentService.createAssignmentForClass(teacherId, classId, learningPathId, parsedDeadline);
            res.status(201).json(assignment);
        } catch (error) {
            res.status(500).json({ error: "Failed to create assignment" });
        }
    }

    async getAssignmentsByClass(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const classId: number = parseInt(req.params.classId);
            const teacherId: number = Number(req.user.id);
            const assignments = await teacherAssignmentService.getAssignmentsByClass(classId, teacherId);
            res.status(200).json(assignments);
        } catch (error) {
            res.status(500).json({ error: "Failed to retrieve assignments" });
        }
    }

    async updateAssignment(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const assignmentId: number = parseInt(req.params.assignmentId);
            const learningPathId: number = req.body;
            const teacherId: number = Number(req.user.id);
            const updatedAssignment = await teacherAssignmentService.updateAssignment(assignmentId, learningPathId, teacherId);
            res.json(updatedAssignment);
        } catch (error) {
            res.status(500).json({ error: "Failed to update assignment" });
        }
    }

    async deleteAssignment(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const assignmentId: number = parseInt(req.params.assignmentId);
            const teacherId: number = Number(req.user.id);
            await teacherAssignmentService.deleteAssignment(assignmentId, teacherId);
            res.status(204).send();
        } catch (error) {
            res.status(500).json({ error: "Failed to delete assignment" });
        }
    }
}
