import { Response } from "express";
import { AuthenticatedRequest } from "../../interfaces/extendedTypeInterfaces";
import teacherAssignmentService from "../../services/teacherServices/teacherAssignmentService";
import { getUserFromAuthRequest } from "../../helpers/getUserFromAuthRequest";
import asyncHandler from "express-async-handler";

export class AssignmentTeacherController {
  createAssignmentForClass = asyncHandler(
    async (req: AuthenticatedRequest, res: Response): Promise<void> => {
      const teacherId: number = getUserFromAuthRequest(req).id;
      const {
        classId,
        pathRef,
        pathLanguage,
        isExternal,
        deadline,
        title,
        description,
        teamSize,
      }: {
        classId: number;
        pathRef: string;
        pathLanguage: string;
        isExternal: boolean;
        deadline: string;
        title: string;
        description: string;
        teamSize: number;
      } = req.body;

      const parsedDeadline = new Date(deadline);

      const assignment =
        await teacherAssignmentService.createAssignmentForClass(
          teacherId,
          classId,
          pathRef,
          pathLanguage,
          isExternal,
          parsedDeadline,
          title,
          description,
          teamSize,
        );
      res
        .status(201)
        .json({ message: "Assignment successfully created.", assignment });
    },
  );

  createAssignmentWithTeams = async (
    req: AuthenticatedRequest,
    res: Response,
  ): Promise<void> => {
    try {
      const teacherId: number = getUserFromAuthRequest(req).id;
      const {
        pathRef,
        pathLanguage,
        isExternal,
        deadline,
        title,
        description,
        classTeams,
        teamSize,
      } = req.body;

      const parsedDeadline = new Date(deadline);

      const assignment =
        await teacherAssignmentService.createAssignmentWithTeams(
          teacherId,
          pathRef,
          pathLanguage,
          isExternal,
          parsedDeadline,
          title,
          description,
          classTeams,
          teamSize,
        );
      res.status(201).json(assignment);
    } catch {
      res.status(500).json({ error: "Failed to create assignment with teams" });
    }
  };

  getAllAssignments = asyncHandler(
    async (req: AuthenticatedRequest, res: Response): Promise<void> => {
      const teacherId: number = getUserFromAuthRequest(req).id;
      const limit: number | undefined = req.query.limit
        ? parseInt(req.query.limit as string)
        : undefined;

      const assignments = await teacherAssignmentService.getAllAssignments(
        teacherId,
        limit,
      );

      res.status(200).json(assignments);
    },
  );

  getAssignmentsByClass = asyncHandler(
    async (req: AuthenticatedRequest, res: Response): Promise<void> => {
      const classId: number = parseInt(req.params.classId);
      const teacherId: number = getUserFromAuthRequest(req).id;
      const assignments = await teacherAssignmentService.getAssignmentsByClass(
        classId,
        teacherId,
      );
      res.status(200).json(assignments);
    },
  );

  updateAssignment = asyncHandler(
    async (req: AuthenticatedRequest, res: Response): Promise<void> => {
      // classId: class3.id,
      // pathRef: lp1.id,
      // deadline: "2026-10-23",
      // pathLanguage: "nl",
      // title: "Learning Path 1",
      // description: "description1",
      // teamSize: 2,
      const assignmentId: number = parseInt(req.params.assignmentId);
      const { pathRef, isExternal, title, description, teamSize } = req.body;
      const teacherId: number = getUserFromAuthRequest(req).id;
      const updatedAssignment = await teacherAssignmentService.updateAssignment(
        assignmentId,
        pathRef,
        isExternal,
        teacherId,
        title,
        description,
        teamSize,
      );
      res.json({
        message: "Assignment successfully updated.",
        updatedAssignment,
      });
    },
  );

  deleteAssignment = asyncHandler(
    async (req: AuthenticatedRequest, res: Response): Promise<void> => {
      const assignmentId: number = parseInt(req.params.assignmentId);
      const teacherId: number = getUserFromAuthRequest(req).id;
      await teacherAssignmentService.deleteAssignment(assignmentId, teacherId);
      res.status(204).end();
    },
  );

  updateAssignmentWithTeams = async (
    req: AuthenticatedRequest,
    res: Response,
  ): Promise<void> => {
    try {
      const assignmentId: number = parseInt(req.params.assignmentId);
      const {
        pathRef,
        pathLanguage,
        isExternal,
        deadline,
        title,
        description,
        classTeams,
        teamSize,
      } = req.body;
      const teacherId: number = getUserFromAuthRequest(req).id;
      const parsedDeadline = new Date(deadline);

      const updatedAssignment =
        await teacherAssignmentService.updateAssignmentWithTeams(
          assignmentId,
          teacherId,
          pathRef,
          pathLanguage,
          isExternal,
          parsedDeadline,
          title,
          description,
          classTeams,
          teamSize,
        );
      res.json(updatedAssignment);
    } catch {
      res.status(500).json({ error: "Failed to update assignment and teams" });
    }
  };
}
