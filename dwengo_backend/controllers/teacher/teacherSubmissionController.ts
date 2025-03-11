import {Response} from "express";
import service from "../../services/submissionService";
import {AuthenticatedRequest} from "../../interfaces/extendedTypeInterfaces";
import {Submission} from "@prisma/client";

export default class TeacherSubmissionController {
    static async getSubmissionsForStudent(req: AuthenticatedRequest, res: Response) {
        const studentId: number = Number(req.params.studentId);
        const teacherId: number = Number(req.user?.id);

        const submissions: Submission[] = await service.teacherGetSubmissionsForStudent(studentId, teacherId);

        res.json(submissions);
    }

    static async getSubmissionsForTeam(req: AuthenticatedRequest, res: Response) {
        const teamId: number = Number(req.params.teamId);
        const teacherId: number = Number(req.user?.id);

        const submissions: Submission[] = await service.teacherGetSubmissionsForTeam(teamId, teacherId, assignmentId);

        res.json(submissions);
    }

    static async getAssignmentSubmissionsForStudent(req: AuthenticatedRequest, res: Response) {
        const {studentId, assignmentId}: { studentId: number, assignmentId: number } = req.params;
        const teacherId: number = Number(req.user?.id);

        const submissions: Submission[] = await service.teacherGetSubmissionsForStudent(studentId, teacherId, assignmentId);

        res.json(submissions);
    }

    static async getAssignmentSubmissionsForTeam(req: AuthenticatedRequest, res: Response) {
        const {teamId, assignmentId}: { teamId: number, assignmentId: number } = req.params;
        const teacherId: number = Number(req.user?.id);

        const submissions: Submission[] = await service.teacherGetSubmissionsForTeam(teamId, teacherId, assignmentId);

        res.json(submissions);
    }
}