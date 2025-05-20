import { Assignment, Role } from "@prisma/client";
import { canUpdateOrDelete, isAuthorized } from "./authorizationService";
import ReferenceValidationService from "./referenceValidationService";
// ^ let op: named import, géén "default" meer.
import { TeamDivision } from "../interfaces/extendedTypeInterfaces";
import { createTeamsInAssignment } from "./teacherTeamsService";
import prisma from "../config/prisma";
import {
  handlePrismaQuery,
  handlePrismaTransaction,
} from "../errors/errorFunctions";

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
    description: string,
    teamSize: number,
  ): Promise<Assignment> {
    // 1) check authorization
    await isAuthorized(teacherId, Role.TEACHER, classId);

    // 2) Valideer pathRef
    // => isExternal=true => Dwengo (hruid + language)
    // => isExternal=false => lokaal (localId=pathRef)
    await ReferenceValidationService.validateLearningPath(
      isExternal,
      isExternal ? undefined : pathRef, // localId
      isExternal ? pathRef : undefined, // hruid
      isExternal ? pathLanguage : undefined, // language
    );

    // 3) Maak assignment
    return await handlePrismaQuery(() =>
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
          teamSize,
        },
      }),
    );
  }

  /**
   * Haal alle assignments op voor 1 teacher
   */
  static async getAllAssignments(
    teacherId: number,
    limit: number | undefined,
  ): Promise<Assignment[]> {
    return await handlePrismaQuery(() =>
      prisma.assignment.findMany({
        where: {
          classAssignments: {
            some: {
              class: {
                ClassTeacher: {
                  some: {
                    teacherId,
                  },
                },
              },
            },
          },
        },
        orderBy: {
          deadline: "desc",
        },
        take: limit,
      }),
    );
  }

  /**
   * Haal alle assignments op voor 1 klas
   */
  static async getAssignmentsByClass(
    classId: number,
    teacherId: number,
  ): Promise<Assignment[]> {
    await isAuthorized(teacherId, Role.TEACHER, classId);
    return await handlePrismaQuery(() =>
      prisma.assignment.findMany({
        where: {
          classAssignments: {
            some: {
              classId,
            },
          },
        },
      }),
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
    description: string,
    teamSize: number,
  ): Promise<Assignment> {
    // 1) autorisatie
    await canUpdateOrDelete(teacherId, assignmentId);

    // 2) validate new pathRef
    await ReferenceValidationService.validateLearningPath(isExternal, pathRef);

    // 3) update
    return handlePrismaQuery(() =>
      prisma.assignment.update({
        where: { id: assignmentId },
        data: {
          pathRef: pathRef,
          isExternal: isExternal,
          title: title,
          description: description,
          teamSize: teamSize,
        },
      }),
    );
  }

  /**
   * Delete assignment
   */
  static async deleteAssignment(
    assignmentId: number,
    teacherId: number,
  ): Promise<Assignment> {
    await canUpdateOrDelete(teacherId, assignmentId);

    return await handlePrismaQuery(() =>
      prisma.assignment.delete({
        where: { id: assignmentId },
      }),
    );
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
    classTeams: ClassTeams,
    teamSize: number,
  ): Promise<Assignment> {
    // 1) Check authorization for all classes
    await Promise.all(
      Object.keys(classTeams).map(async (classId) => {
        await isAuthorized(teacherId, Role.TEACHER, parseInt(classId));
      }),
    );

    // 2) Validate pathRef
    await ReferenceValidationService.validateLearningPath(
      isExternal,
      isExternal ? undefined : pathRef, // localId
      isExternal ? pathRef : undefined, // hruid
      isExternal ? pathLanguage : undefined, // language
    );

    // 3) Create assignment and teams in transaction
    return await handlePrismaTransaction(prisma, async (tx) => {
      // Create the assignment
      const assignment = await tx.assignment.create({
        data: {
          pathRef,
          isExternal,
          deadline,
          title,
          description,
          teamSize,
        },
      });

      //*
      // Deze for loop moet blijven staan. Je mag geen Promise.all() gebruiken in een transaction.
      // Error: PrismaClientTransactionInvalidError: Transaction API error: cannot run multiple operations in parallel on the same transaction.
      // *//
      // Create class assignments and teams
      for (const [classId, teams] of Object.entries(classTeams)) {
        await tx.classAssignment.create({
          data: {
            assignmentId: assignment.id,
            classId: parseInt(classId),
          },
        });
        await createTeamsInAssignment(
          assignment.id,
          parseInt(classId),
          teams,
          tx,
        );
      }

      return assignment;
    });
  }

  /**
   * Update an assignment and its team structure
   */
  static async updateAssignmentWithTeams(
    assignmentId: number,
    teacherId: number,
    pathRef: string,
    pathLanguage: string,
    isExternal: boolean,
    deadline: Date,
    title: string,
    description: string,
    classTeams: ClassTeams,
    teamSize: number,
  ): Promise<Assignment> {
    // Authorization checks remain the same
    await canUpdateOrDelete(teacherId, assignmentId);
    await Promise.all(
      Object.keys(classTeams).map(async (classId) => {
        await isAuthorized(teacherId, Role.TEACHER, parseInt(classId));
      }),
    );

    // PathRef validation remains the same
    await ReferenceValidationService.validateLearningPath(
      isExternal,
      isExternal ? undefined : pathRef,
      isExternal ? pathRef : undefined,
      isExternal ? pathLanguage : undefined,
    );

    return await handlePrismaTransaction(prisma, async (tx) => {
      // Update the assignment basic info
      const assignment = await tx.assignment.update({
        where: { id: assignmentId },
        data: {
          pathRef,
          isExternal,
          deadline,
          title,
          description,
          teamSize,
        },
      });

      // Update teams for each class
      for (const [classId, newTeams] of Object.entries(classTeams)) {
        // Get existing teams for this class
        const existingTeams = await tx.team.findMany({
          where: {
            teamAssignment: {
              assignmentId,
              team: {
                classId: parseInt(classId),
              },
            },
          },
          include: {
            students: true,
          },
        });

        // Update existing teams and create new ones if needed
        for (const [index, newTeam] of newTeams.entries()) {
          const existingTeam = existingTeams[index];

          if (existingTeam) {
            // Update existing team
            await tx.team.update({
              where: { id: existingTeam.id },
              data: {
                teamname: newTeam.teamname,
                students: {
                  // First disconnect all existing students
                  set: [],
                  // Then connect the new students
                  connect: newTeam.studentIds.map((studentId: number) => ({
                    userId: studentId,
                  })),
                },
              },
            });
          } else {
            // Create new team
            console.log(
              `Creating new team for class ${classId} with teamname ${newTeam.teamName}`,
            );
            await tx.team.create({
              data: {
                teamname: newTeam.teamName,
                classId: parseInt(classId),
                teamAssignment: {
                  create: {
                    assignmentId,
                  },
                },
                students: {
                  connect: newTeam.studentIds.map((studentId: number) => ({
                    userId: studentId,
                  })),
                },
              },
            });
          }
        }

        // Remove any excess teams
        if (existingTeams.length > newTeams.length) {
          const teamsToRemove = existingTeams.slice(newTeams.length);
          await tx.team.deleteMany({
            where: {
              id: {
                in: teamsToRemove.map((team) => team.id),
              },
            },
          });
        }
      }

      return assignment;
    });
  }
}
