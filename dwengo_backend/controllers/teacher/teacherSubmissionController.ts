import { NextFunction, Response } from "express";
import service from "../../services/submissionService";
import { AuthenticatedRequest } from "../../interfaces/extendedTypeInterfaces";
import { Submission } from "@prisma/client";
import { getUserFromAuthRequest } from "../../helpers/getUserFromAuthRequest";

export default class TeacherSubmissionController {
  static async getSubmissionsForStudent(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const studentId: number = parseInt(req.params.studentId);
      const teacherId: number = getUserFromAuthRequest(req).id;

      const submissions: Submission[] =
        await service.teacherGetSubmissionsForStudent(studentId, teacherId);

      res.status(200).json(submissions);
    } catch (error) {
      next(error);
    }
  }

  static async getSubmissionsForTeam(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const teamId: number = Number(req.params.teamId);
      const teacherId: number = getUserFromAuthRequest(req).id;

      const submissions: Submission[] =
        await service.teacherGetSubmissionsForTeam(teamId, teacherId);

      res.status(200).json(submissions);
    } catch (error) {
      next(error);
    }
  }

  static async getAssignmentSubmissionsForStudent(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { studentId, assignmentId } = req.params;
      const teacherId: number = getUserFromAuthRequest(req).id;

      const submissions: Submission[] =
        await service.teacherGetSubmissionsForStudent(
          Number(studentId),
          teacherId,
          Number(assignmentId),
        );

      res.status(200).json(submissions);
    } catch (error) {
      next(error);
    }
  }

  static async getAssignmentSubmissionsForTeam(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { teamId, assignmentId } = req.params;
      const teacherId: number = getUserFromAuthRequest(req).id;

      const submissions: Submission[] =
        await service.teacherGetSubmissionsForTeam(
          Number(teamId),
          teacherId,
          Number(assignmentId),
        );

      res.status(200).json(submissions);
    } catch (error) {
      next(error);
    }
  }
}
