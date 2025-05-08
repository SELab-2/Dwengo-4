import { Response } from "express";
import service from "../../services/submissionService";
import { AuthenticatedRequest } from "../../interfaces/extendedTypeInterfaces";
import { Submission } from "@prisma/client";
import { getUserFromAuthRequest } from "../../helpers/getUserFromAuthRequest";
import asyncHandler from "express-async-handler";

export default class TeacherSubmissionController {
  getSubmissionsForStudent = asyncHandler(
    async (req: AuthenticatedRequest, res: Response): Promise<void> => {
      const studentId: number = req.params.studentId as unknown as number;
      const teacherId: number = getUserFromAuthRequest(req).id;

      const submissions: Submission[] =
        await service.teacherGetSubmissionsForStudent(studentId, teacherId);

      res.status(200).json(submissions);
    },
  );

  getSubmissionsForTeam = asyncHandler(
    async (req: AuthenticatedRequest, res: Response): Promise<void> => {
      const teamId: number = req.params.teamId as unknown as number;
      const teacherId: number = getUserFromAuthRequest(req).id;

      const submissions: Submission[] =
        await service.teacherGetSubmissionsForTeam(teamId, teacherId);

      res.status(200).json(submissions);
    },
  );

  /*getAssignmentSubmissionsForStudent = asyncHandler(
    async (req: AuthenticatedRequest, res: Response): Promise<void> => {
      const { studentId, assignmentId } = req.params;
      const teacherId: number = getUserFromAuthRequest(req).id;

      const submissions: Submission[] =
        await service.teacherGetSubmissionsForStudent(
          Number(studentId),
          teacherId,
          Number(assignmentId),
        );

      res.status(200).json(submissions);
    },
  );*/

  getAssignmentSubmissionsForTeam = asyncHandler(
    async (req: AuthenticatedRequest, res: Response): Promise<void> => {
      const teamId = req.params.teamId as unknown as number;
      const assignmentId = req.params.assignmentId as unknown as number;
      const teacherId: number = getUserFromAuthRequest(req).id;

      const submissions: Submission[] =
        await service.teacherGetSubmissionsForTeam(
          teamId,
          teacherId,
          assignmentId,
        );

      res.status(200).json(submissions);
    },
  );
}
