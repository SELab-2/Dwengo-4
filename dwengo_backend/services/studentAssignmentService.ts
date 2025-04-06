import { Assignment } from "@prisma/client";

import prisma from "../config/prisma";
import { handlePrismaQuery } from "../errors/errorFunctions";

/**
 * Haalt alle assignments op die een student (studentId) kan zien,
 * gesorteerd op meegegeven velden, en limiteer met 'limit'.
 *
 * Let op: 'pathRef' en 'isExternal' staan nu in Assignment,
 * we laten ze gewoon meekomen in de resultaten.
 */
export const getAssignmentsForStudent = async (
  studentId: number,
  sortFields: string[],
  order: "asc" | "desc",
  limit: number,
): Promise<Assignment[]> => {
  return handlePrismaQuery(() =>
    prisma.assignment.findMany({
      where: {
        classAssignments: {
          some: {
            class: {
              classLinks: {
                some: {
                  studentId: studentId,
                },
              },
            },
          },
        },
      },
      orderBy: sortFields.map((field: string) => ({ [field]: order })),
      take: limit,
    }),
  );
};
