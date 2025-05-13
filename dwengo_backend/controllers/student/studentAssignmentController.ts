import { Response } from "express";
import {
  getAssignmentsForStudent,
  getAssignmentsForStudentInClass,
  isStudentInClass,
} from "../../services/studentAssignmentService";
import ProgressService from "../../services/progressService";
import { Assignment } from "@prisma/client";
import { AuthenticatedRequest } from "../../interfaces/extendedTypeInterfaces";
import { getUserFromAuthRequest } from "../../helpers/getUserFromAuthRequest";
import asyncHandler from "express-async-handler";

function extractSortableFields(input: string): string[] {
  const allowedSortFields: string[] = ["deadline", "createdAt", "updatedAt"];
  return (
    input
      ?.split(",")
      .filter((field: string): boolean =>
        allowedSortFields.includes(field),
      ) || ["deadline"]
  );
}

export const getStudentAssignments = asyncHandler(
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const studentId: number = getUserFromAuthRequest(req).id;
    // Een URL van volgend formaat wordt verwacht
    // GET /assignments?sort=deadline&order=desc&limit=5

    // Sorteer standaard de deadline, extra velden kunnen meegegeven worden
    const sortFields: string[] = extractSortableFields(
      req.query.sort as string,
    );
    // Sorteer standaard ascending, descending kan ook
    const order: "desc" | "asc" = req.query.order === "desc" ? "desc" : "asc";

    // Haal standaard 5 assignments op, andere hoeveelheden kunnen ook
    const limit: number = req.query.limit as unknown as number;

    const assignments: Assignment[] = await getAssignmentsForStudent(
      studentId,
      sortFields,
      order,
      limit,
    );
    console.log(assignments);
    const assignmentsWithProgress = await Promise.all(
      assignments.map(async (assignment) => {
        console.log("assignment", assignment);
        const progress = await ProgressService.getAssignmentProgressForStudent(assignment.id, studentId);
        return {
          ...assignment,
          progress
        };
      })
    );
    res.status(200).json(assignmentsWithProgress);

  },
);

export const getStudentAssignmentsInClass = asyncHandler(
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const studentId: number = getUserFromAuthRequest(req).id;
    const classId: number = req.params.classId as unknown as number;

    // Controleer of student wel in gegeven klas zit
    await isStudentInClass(studentId, classId);

    // Sorteer standaard de deadline, extra velden kunnen meegegeven worden
    const sortFields: string[] = extractSortableFields(
      req.query.sort as string,
    );

    // Sorteer standaard ascending, descending kan ook
    const order: "desc" | "asc" = req.query.order === "desc" ? "desc" : "asc";

    // Haal standaard 5 assignments op, andere hoeveelheden kunnen ook
    const limit: number = req.query.limit as unknown as number;

    const assignments: Assignment[] = await getAssignmentsForStudentInClass(
      studentId,
      classId,
      sortFields,
      order,
      limit,
    );
    res.status(200).json(assignments);
  },
);
