import {Response} from "express";
import service from "../../services/submissionService";
import {AuthenticatedRequest} from "../../interfaces/extendedTypeInterfaces";
import {Submission} from "@prisma/client";
import {getUserFromAuthRequest} from "../../helpers/getUserFromAuthRequest";

export default class TeacherSubmissionController {
    static async getSubmissionsForStudent(req: AuthenticatedRequest, res: Response) {
        const studentId: number = Number(req.params.studentId);
        const teacherId: number = getUserFromAuthRequest(req).id;

        const submissions: Submission[] = await service.teacherGetSubmissionsForStudent(studentId, teacherId);

        res.json(submissions);
    }

    static async getSubmissionsForTeam(req: AuthenticatedRequest, res: Response) {
        const teamId: number = Number(req.params.teamId);
        const teacherId: number = getUserFromAuthRequest(req).id;

        const submissions: Submission[] = await service.teacherGetSubmissionsForTeam(teamId, teacherId);

        res.json(submissions);
    }

    static async getAssignmentSubmissionsForStudent(req: AuthenticatedRequest, res: Response) {
        const {studentId, assignmentId} = req.params;
        const teacherId: number = getUserFromAuthRequest(req).id;

        const submissions: Submission[] = await service.teacherGetSubmissionsForStudent(Number(studentId), teacherId, Number(assignmentId));

        res.json(submissions);
    }

    static async getAssignmentSubmissionsForTeam(req: AuthenticatedRequest, res: Response) {
        const {teamId, assignmentId} = req.params;
        const teacherId: number = getUserFromAuthRequest(req).id;

        const submissions: Submission[] = await service.teacherGetSubmissionsForTeam(Number(teamId), teacherId, Number(assignmentId));

        res.json(submissions);
    }
}