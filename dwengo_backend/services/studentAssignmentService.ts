import { Assignment } from "@prisma/client";

import prisma from "../config/prisma";
import { handlePrismaQuery } from "../errors/errorFunctions";
import { AccessDeniedError } from "../errors/errors";

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
  limit: number
): Promise<Assignment[]> => {
  return await handlePrismaQuery(() =>
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
    })
  );
};

export const getAssignmentsForStudentInClass = async (
  studentId: number,
  classId: number,
  sortFields: string[],
  order: "asc" | "desc",
  limit: number
): Promise<Assignment[]> => {
  return await handlePrismaQuery(() =>
    prisma.assignment.findMany({
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
      take: limit,
    })
  );
};

export const isStudentInClass = async (
  studentId: number,
  classId: number
): Promise<void> => {
  const studentInClass = await handlePrismaQuery(() =>
    prisma.classStudent.findFirst({
      where: {
        studentId: studentId,
        classId: classId,
      },
    })
  );

  if (!studentInClass) {
    throw new AccessDeniedError("Student is not a part of this class.");
  }
};
