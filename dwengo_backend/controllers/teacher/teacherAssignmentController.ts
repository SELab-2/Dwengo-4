import { Response } from "express";
import { AuthenticatedRequest } from "../../interfaces/extendedTypeInterfaces";
import teacherAssignmentService from "../../services/teacherServices/teacherAssignmentService";
import { getUserFromAuthRequest } from "../../helpers/getUserFromAuthRequest";

export class AssignmentTeacherController {
  createAssignmentForClass = async (
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> => {
    try {
      const teacherId: number = getUserFromAuthRequest(req).id;
      const {
        classId,
        pathRef,
        pathLanguage,
        isExternal,
        deadline,
      }: {
        classId: number;
        pathRef: string;
        pathLanguage: string;
        isExternal: boolean;
        deadline: string;
      } = req.body;

      const parsedDeadline = new Date(deadline);

      const assignment =
        await teacherAssignmentService.createAssignmentForClass(
          teacherId,
          classId,
          pathRef,
          pathLanguage,
          isExternal,
          parsedDeadline
        );
      res.status(201).json(assignment);
    } catch (error) {
      res.status(500).json({ error: "Failed to create assignment" });
    }
  };

  getAssignmentsByClass = async (
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> => {
    try {
      const classId: number = parseInt(req.params.classId);
      const teacherId: number = getUserFromAuthRequest(req).id;
      const assignments = await teacherAssignmentService.getAssignmentsByClass(
        classId,
        teacherId
      );
      res.status(200).json(assignments);
    } catch (error) {
      res.status(500).json({ error: "Failed to retrieve assignments" });
    }
  };

  updateAssignment = async (
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> => {
    try {
      const assignmentId: number = parseInt(req.params.assignmentId);
      const { pathRef, isExternal } = req.body;
      const teacherId: number = getUserFromAuthRequest(req).id;

      const updatedAssignment = await teacherAssignmentService.updateAssignment(
        assignmentId,
        pathRef,
        isExternal,
        teacherId
      );
      res.json(updatedAssignment);
    } catch (error) {
      res.status(500).json({ error: "Failed to update assignment" });
    }
  };

  deleteAssignment = async (
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> => {
    console.log("hallo");
    try {
      console.log("hallo");
      const assignmentId: number = parseInt(req.params.assignmentId);
      const teacherId: number = getUserFromAuthRequest(req).id;
      console.log("AAAAAAAAAAAAAAA");
      await teacherAssignmentService.deleteAssignment(assignmentId, teacherId);
      console.log("AAAAAAAAAAAAAAA");
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete assignment" });
    }
  };
}
