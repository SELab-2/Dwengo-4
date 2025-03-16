import { Response } from "express";
import { getAssignmentsForStudent } from "../../services/studentAssignmentService";
import { Assignment } from "@prisma/client";
import { AuthenticatedRequest } from "../../interfaces/extendedTypeInterfaces";
import { getUserFromAuthRequest } from "../../helpers/getUserFromAuthRequest";

const allowedSortFields = ["deadline", "createdAt", "updatedAt"];

function extractSortableFields(input: string): string[] {
  return (
    input?.split(",").filter((field) => allowedSortFields.includes(field)) || [
      "deadline",
    ]
  );
}

export const getStudentAssignments = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const studentId: number = getUserFromAuthRequest(req).id;
    // Een URL van volgend formaat wordt verwacht
    // GET /assignments?sort=deadline&order=desc&limit=5

    // Sorteer standaard de deadline, extra velden kunnen meegegeven worden
    const sortFields: string[] = extractSortableFields(req.query.sort as string);
    const order: "desc" | "asc" = req.query.order === "desc" ? "desc" : "asc";
    // Sorteer standaard ascending, descending kan ook
    const limit: number = Number(req.query.limit) || 5;
    // Haal standaard 5 assignments op, andere hoeveelheden kunnen ook

    if (isNaN(limit) || limit <= 0) {
      res.status(400).json({ error: "Limit wasn't a valid number" });
      return;
    }

    const assignments: Assignment[] = await getAssignmentsForStudent(
      studentId,
      sortFields,
      order,
      limit
    );
    res.status(200).json(assignments);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Something went wrong while requesting the assignments" });
  }
};
