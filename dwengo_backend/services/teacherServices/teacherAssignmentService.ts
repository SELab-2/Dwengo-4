
import { Assignment, PrismaClient, Role } from "@prisma/client";
import { canUpdateOrDelete, isAuthorized } from "../authorizationService";
import  ReferenceValidationService  from "../../services/referenceValidationService"; 
// ^ let op: named import, géén "default" meer.

const prisma = new PrismaClient();

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
    deadline: Date
  ): Promise<Assignment> {
    // 1) check authorization
    if (!(await isAuthorized(teacherId, Role.TEACHER, classId))) {
      throw new Error("The teacher is unauthorized to perform this action");
    }
  
    // 2) Valideer pathRef
    // => isExternal=true => Dwengo (hruid + language)
    // => isExternal=false => lokaal (localId=pathRef)
    await ReferenceValidationService.validateLearningPath(
      isExternal,
      isExternal ? undefined : pathRef,    // localId
      isExternal ? pathRef : undefined,    // hruid
      isExternal ? pathLanguage : undefined  // language
    );
  
    // 3) Maak assignment
    return prisma.assignment.create({
      data: {
        pathRef,
        isExternal,
        deadline,
        classAssignments: {
          create: {
            classId,
          },
        },
      },
    });
  }
  

  /**
   * Haal alle assignments op voor 1 klas
   */
  static async getAssignmentsByClass(
    classId: number,
    teacherId: number
  ): Promise<Assignment[]> {
    if (!(await isAuthorized(teacherId, Role.TEACHER, classId))) {
      throw new Error("The teacher is unauthorized to request the assignments");
    }
    return prisma.assignment.findMany({
      where: {
        classAssignments: {
          some: {
            classId,
          },
        },
      },
    });
  }

  /**
   * Update assignment => pathRef/isExternal
   */
  static async updateAssignment(
    assignmentId: number,
    pathRef: string,
    isExternal: boolean,
    teacherId: number
  ): Promise<Assignment> {
    // 1) autorisatie
    if (!(await canUpdateOrDelete(teacherId, assignmentId))) {
      throw new Error("The teacher is unauthorized to update the assignment");
    }

    // 2) validate new pathRef
    await ReferenceValidationService.validateLearningPath( isExternal,pathRef);

    // 3) update
    return prisma.assignment.update({
      where: { id: assignmentId },
      data: {
        pathRef,
        isExternal,
      },
    });
  }

  /**
   * Delete assignment
   */
  static async deleteAssignment(
    assignmentId: number,
    teacherId: number
  ): Promise<Assignment> {
    if (!(await canUpdateOrDelete(teacherId, assignmentId))) {
      throw new Error("The teacher is unauthorized to delete the assignment");
    }

    return prisma.assignment.delete({
      where: { id: assignmentId },
    });
  }
}
