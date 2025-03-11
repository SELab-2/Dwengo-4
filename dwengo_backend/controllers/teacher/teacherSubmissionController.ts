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
}