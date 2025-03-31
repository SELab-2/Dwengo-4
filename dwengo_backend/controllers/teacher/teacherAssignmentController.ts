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
        title,
        description,
        teamSize
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
          teamSize
        );
      res.status(201).json(assignment);
    } catch (error) {
      res.status(500).json({ error: "Failed to create assignment" });
    }
  };

  createAssignmentWithTeams = async (
    req: AuthenticatedRequest,
    res: Response
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
        teamSize
      } = req.body;


      const parsedDeadline = new Date(deadline);

      const assignment = await teacherAssignmentService.createAssignmentWithTeams(
        teacherId,
        pathRef,
        pathLanguage,
        isExternal,
        parsedDeadline,
        title,
        description,
        classTeams,
        teamSize
      );
      res.status(201).json(assignment);
    } catch (error) {
      res.status(500).json({ error: "Failed to create assignment with teams" });
    }
  };

  getAllAssignments = async (
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> => {
    try {
      const teacherId: number = getUserFromAuthRequest(req).id;
      const assignments = await teacherAssignmentService.getAllAssignments(
        teacherId
      );
      res.status(200).json(assignments);
    } catch (error) {
      res.status(500).json({ error: "Failed to retrieve assignments" });
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
      const { pathRef, isExternal, title, description, teamSize } = req.body;
      const teacherId: number = getUserFromAuthRequest(req).id;

      const updatedAssignment = await teacherAssignmentService.updateAssignment(
        assignmentId,
        pathRef,
        isExternal,
        teacherId,
        title,
        description,
        teamSize
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
    try {
      const assignmentId: number = parseInt(req.params.assignmentId);
      const teacherId: number = getUserFromAuthRequest(req).id;
      await teacherAssignmentService.deleteAssignment(assignmentId, teacherId);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete assignment" });
    }
  };

  updateAssignmentWithTeams = async (
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> => {
    try {
      const assignmentId: number = parseInt(req.params.assignmentId);
      const { pathRef, pathLanguage, isExternal, deadline, title, description, classTeams, teamSize } = req.body;
      const teacherId: number = getUserFromAuthRequest(req).id;
      const parsedDeadline = new Date(deadline);

      const updatedAssignment = await teacherAssignmentService.updateAssignmentWithTeams(
        assignmentId,
        teacherId,
        pathRef,
        pathLanguage,
        isExternal,
        parsedDeadline,
        title,
        description,
        classTeams,
        teamSize
      );
      res.json(updatedAssignment);
    } catch (error) {
      res.status(500).json({ error: "Failed to update assignment and teams" });
    }
  };
}


