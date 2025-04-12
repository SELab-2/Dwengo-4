import { Assignment } from "@prisma/client";

import prisma from "../config/prisma";

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
  return prisma.assignment.findMany({
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
    // We hebben geen 'learningPath' relation meer, dus geen include needed
  });
};

export const getAssignmentsForStudentInClass = async (
  studentId: number,
  classId: number,
  sortFields: string[],
  order: "asc" | "desc",
): Promise<Assignment[]> => {
  return prisma.assignment.findMany({
    where: {
      classAssignments: {
        some: {
          classId: classId,
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
  });
};
