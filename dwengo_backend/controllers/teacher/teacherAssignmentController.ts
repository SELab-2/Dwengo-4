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
      }: {
        classId: number;
        pathRef: string;
        pathLanguage: string;
        isExternal: boolean;
        deadline: string;
        title: string;
        description: string;
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
        );
      res
        .status(201)
        .json({ message: "Assignment successfully created.", assignment });
    },
  );

  getAllAssignments = asyncHandler(
    async (req: AuthenticatedRequest, res: Response): Promise<void> => {
      const teacherId: number = getUserFromAuthRequest(req).id;
      const assignments =
        await teacherAssignmentService.getAllAssignments(teacherId);
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
      const assignmentId: number = parseInt(req.params.assignmentId);
      const { pathRef, isExternal, title, description } = req.body;
      const teacherId: number = getUserFromAuthRequest(req).id;

      const updatedAssignment = await teacherAssignmentService.updateAssignment(
        assignmentId,
        pathRef,
        isExternal,
        teacherId,
        title,
        description,
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
      res.status(204).json({
        message: "Assignment successfully deleted.",
      });
    },
  );
}
