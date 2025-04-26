import { Response } from "express";
import {
  getAssignmentsForStudent,
  getAssignmentsForStudentInClass,
  isStudentInClass,
} from "../../services/studentAssignmentService";
import { Assignment } from "@prisma/client";
import { AuthenticatedRequest } from "../../interfaces/extendedTypeInterfaces";
import { getUserFromAuthRequest } from "../../helpers/getUserFromAuthRequest";
import asyncHandler from "express-async-handler";
import { BadRequestError } from "../../errors/errors";

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
    const order: "desc" | "asc" = req.query.order === "desc" ? "desc" : "asc";
    // Sorteer standaard ascending, descending kan ook
    const limit: number = Number(req.query.limit) || 5;
    // Haal standaard 5 assignments op, andere hoeveelheden kunnen ook

    if (limit <= 0) {
      throw new BadRequestError("Limit must be a positive number.");
    }

    const assignments: Assignment[] = await getAssignmentsForStudent(
      studentId,
      sortFields,
      order,
      limit,
    );
    res.status(200).json(assignments);
  },
);

export const getStudentAssignmentsInClass = asyncHandler(
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const studentId: number = getUserFromAuthRequest(req).id;
    const classId: number = parseInt(req.params.classId);

    // Controleer of student wel in gegeven klas zit
    await isStudentInClass(studentId, classId);

    // Sorteer standaard de deadline, extra velden kunnen meegegeven worden
    const sortFields: string[] = extractSortableFields(
      req.query.sort as string,
    );
    const order: "desc" | "asc" = req.query.order === "desc" ? "desc" : "asc";
    // Sorteer standaard ascending, descending kan ook
    const limit: number = Number(req.query.limit) || 5;
    // Haal standaard 5 assignments op, andere hoeveelheden kunnen ook

    if (limit <= 0) {
      throw new BadRequestError("Limit wasn't a valid number.");
    }

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
