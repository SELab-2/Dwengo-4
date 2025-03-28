import { Assignment, PrismaClient, Role } from "@prisma/client";
import { canUpdateOrDelete, isAuthorized } from "../authorizationService";
import ReferenceValidationService from "../../services/referenceValidationService";
import { TeamDivision } from "../../interfaces/extendedTypeInterfaces";
import { createTeamsInAssignment } from "../teacherTeamsService";

const prisma = new PrismaClient();

interface ClassTeams {
  [classId: number]: TeamDivision[];
}

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
      throw new Error("The teacher is unauthorized to perform this action");
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
        title,
        description,
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
    teacherId: number,
    title: string,
    description: string
  ): Promise<Assignment> {
    // 1) autorisatie
    if (!(await canUpdateOrDelete(teacherId, assignmentId))) {
      throw new Error("The teacher is unauthorized to update the assignment");
    }

    // 2) validate new pathRef
    await ReferenceValidationService.validateLearningPath(isExternal, pathRef);

    // 3) update
    return prisma.assignment.update({
      where: { id: assignmentId },
      data: {
        pathRef,
        isExternal,
        title,
        description,
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

  /**
   * Create an assignment with class teams structure
   */
  static async createAssignmentWithTeams(
    teacherId: number,
    pathRef: string,
    pathLanguage: string,
    isExternal: boolean,
    deadline: Date,
    title: string,
    description: string,
    classTeams: ClassTeams
  ): Promise<Assignment> {
    // 1) Check authorization for all classes
    for (const classId of Object.keys(classTeams)) {
      if (!(await isAuthorized(teacherId, Role.TEACHER, parseInt(classId)))) {
        throw new Error("The teacher is unauthorized to perform this action");
      }
    }

    console.log(pathRef);

    // 2) Validate pathRef
    await ReferenceValidationService.validateLearningPath(
      isExternal,
      isExternal ? undefined : pathRef, // localId
      isExternal ? pathRef : undefined, // hruid
      isExternal ? pathLanguage : undefined // language
    );

    // 3) Create assignment and teams in transaction
    return await prisma.$transaction(async (tx) => {
      console.log("assignment");

      // Create the assignment
      const assignment = await tx.assignment.create({
        data: {
          pathRef,
          isExternal,
          deadline,
          title,
          description,
        },
      });



      console.log("assignment 2");
      // Create class assignments and teams
      for (const [classId, teams] of Object.entries(classTeams)) {
        console.log(classId)
        await tx.classAssignment.create({
          data: {
            assignmentId: assignment.id,
            classId: parseInt(classId),
          },
        });

        console.log("assignment 3");

        await createTeamsInAssignment(assignment.id, parseInt(classId), teams);
      }

      return assignment;
    });
  }
}
