import { Assignment, Role } from "@prisma/client";
import { canUpdateOrDelete, isAuthorized } from "../authorizationService";
import ReferenceValidationService from "../../services/referenceValidationService";
import { AccesDeniedError } from "../../errors/errors";
// ^ let op: named import, géén "default" meer.
import prisma from "../../config/prisma";
import { handlePrismaQuery } from "../../errors/errorFunctions";

export default class TeacherAssignmentService {
  /**
   * Creëer een assignment voor een class, met pathRef/isExternal.
   */
  static async createAssignmentForClass(
    teacherId: number,
    classId: number,
    pathRef: string,
    pathLanguage: string,
    isExternal: boolean,
    deadline: Date,
    title: string,
    description: string
  ): Promise<Assignment> {
    // 1) check authorization
    if (!(await isAuthorized(teacherId, Role.TEACHER, classId))) {
      throw new AccesDeniedError(
        "The teacher is unauthorized to perform this action. Is this teacher a teacher of the class?"
      );
    }

    // 2) Valideer pathRef
    // => isExternal=true => Dwengo (hruid + language)
    // => isExternal=false => lokaal (localId=pathRef)
    await ReferenceValidationService.validateLearningPath(
      isExternal,
      isExternal ? undefined : pathRef, // localId
      isExternal ? pathRef : undefined, // hruid
      isExternal ? pathLanguage : undefined // language
    );

    // 3) Maak assignment
    return handlePrismaQuery(() =>
      prisma.assignment.create({
        data: {
          pathRef,
          isExternal,
          deadline,
          classAssignments: {
            create: {
              classId,
            },
          },
          title,
          description,
        },
      })
    );
  }

  /**
   * Haal alle assignments op voor 1 klas
   */
  static async getAssignmentsByClass(
    classId: number,
    teacherId: number
  ): Promise<Assignment[]> {
    if (!(await isAuthorized(teacherId, Role.TEACHER, classId))) {
      throw new AccesDeniedError(
        "The teacher is unauthorized to request the assignments. Is this teacher a teacher of the class?"
      );
    }
    return handlePrismaQuery(() =>
      prisma.assignment.findMany({
        where: {
          classAssignments: {
            some: {
              classId,
            },
          },
        },
      })
    );
  }

  /**
   * Update assignment => pathRef/isExternal
   */
  static async updateAssignment(
    assignmentId: number,
    pathRef: string,
    isExternal: boolean,
    teacherId: number,
    title: string,
    description: string
  ): Promise<Assignment> {
    // 1) autorisatie
    if (!(await canUpdateOrDelete(teacherId, assignmentId))) {
      throw new AccesDeniedError(
        "The teacher is unauthorized to update the assignment"
      );
    }

    // 2) validate new pathRef
    await ReferenceValidationService.validateLearningPath(isExternal, pathRef);

    // 3) update
    return handlePrismaQuery(() =>
      prisma.assignment.update({
        where: { id: assignmentId },
        data: {
          pathRef,
          isExternal,
          title,
          description,
        },
      })
    );
  }

  /**
   * Delete assignment
   */
  static async deleteAssignment(
    assignmentId: number,
    teacherId: number
  ): Promise<Assignment> {
    if (!(await canUpdateOrDelete(teacherId, assignmentId))) {
      throw new AccesDeniedError(
        "The teacher is unauthorized to delete the assignment"
      );
    }

    return handlePrismaQuery(() =>
      prisma.assignment.delete({
        where: { id: assignmentId },
      })
    );
  }
}
