import {
  Class,
  ClassStudent,
  ClassTeacher,
  Student,
  User,
} from "@prisma/client";
import crypto from "crypto";
import {
  AccessDeniedError,
  BadRequestError,
  ConflictError,
} from "../errors/errors";
import {
  handlePrismaDelete,
  handlePrismaQuery,
  handleQueryWithExistenceCheck,
} from "../errors/errorFunctions";

import prisma from "../config/prisma";

export type ClassWithLinks = Class & { classLinks: ClassStudent[] };

export default class ClassService {
  static async createClass(name: string, teacherId: number): Promise<Class> {
    // Generate a unique join code (e.g., an 8-digit hex string)
    const joinCode = await this.generateUniqueCode();

    const classroom = await handlePrismaQuery(() =>
      prisma.class.create({
        data: {
          name: name, // name field matches the Class schema
          code: joinCode, // code field matches the Class schema
        },
      }),
    );

    // Now that you have the class id, create the ClassTeacher record
    await handlePrismaQuery(() =>
      prisma.classTeacher.create({
        data: {
          teacherId: teacherId, // teacherId links to the teacher record
          classId: classroom.id, // Use the id of the newly created class
        },
      }),
    );

    return classroom;
  }

  // this function checks if the class exists and if the teacher is associated with the class
  // if either of these conditions are not met, an error is thrown
  private static async verifyClassAndTeacher(
    classId: number,
    teacherId: number,
  ): Promise<void> {
    // Check if the class exists
    await handleQueryWithExistenceCheck(
      () =>
        prisma.class.findUnique({
          where: { id: classId },
        }),
      `Class not found.`,
    );

    // Check if the teacher is associated with the class
    await this.isTeacherOfClass(classId, teacherId);
  }

  // Delete a class by ID
  static async deleteClass(classId: number, teacherId: number): Promise<Class> {
    await this.verifyClassAndTeacher(classId, teacherId);
    return handlePrismaDelete(
      () => prisma.class.delete({ where: { id: classId } }),
      `Class with ID ${classId} does not exist. Cannot delete.`,
    );
  }

  // Get all classes taught by a given teacher
  static async getClassesByTeacher(teacherId: number): Promise<Class[]> {
    // Fetch all classes where the teacher is assigned
    return await handlePrismaQuery(() =>
      prisma.class.findMany({
        where: {
          ClassTeacher: {
            some: {
              teacherId: teacherId, // Filter for the given teacherId
            },
          },
        },
      }),
    );
  }

  // Get all classes a student is partaking in
  static async getClassesByStudent(studentId: number): Promise<Class[]> {
    // Fetch all classes where the student is enrolled
    return await handlePrismaQuery(() =>
      prisma.class.findMany({
        where: {
          classLinks: {
            some: {
              studentId: studentId, // Filter for the given studentId
            },
          },
        },
      }),
    );
  }

  static async getStudentClassByClassId(
    studentId: number,
    classId: number,
  ): Promise<Class> {
    // Fetch all classes where the student is enrolled
    const c: Class | null = await prisma.class.findUnique({
      where: {
        id: classId,
        classLinks: {
          some: {
            studentId: studentId, // Filter for the given studentId
          },
        },
      },
    });
    if (!c) {
      throw new AccessDeniedError(`Student is not a part of the given class.`);
    }
    return c;
  }

  static async leaveClassAsStudent(
    studentId: number,
    classId: number,
  ): Promise<ClassStudent> {
    const inClass = await prisma.classStudent.findUnique({
      where: {
        studentId_classId: {
          studentId: studentId,
          classId: classId,
        },
      },
    });

    if (!inClass) {
      throw new BadRequestError(
        "Student is not a part of this class and is therefore not able to leave it.",
      );
    }

    return handlePrismaDelete(() =>
      prisma.classStudent.delete({
        where: {
          studentId_classId: {
            studentId: studentId,
            classId: classId,
          },
        },
      }),
    );
  }

  // Update a class's information
  static async updateClass(
    classId: number,
    teacherId: number,
    name: string,
  ): Promise<Class> {
    await this.verifyClassAndTeacher(classId, teacherId);

    return prisma.class.update({
      where: { id: classId },
      data: { name },
    });
  }

  // Function to check if the requester is the teacher of the class
  static async isTeacherOfClass(
    classId: number,
    teacherId: number,
  ): Promise<void> {
    const classTeacher: ClassTeacher | null = await handlePrismaQuery(() =>
      prisma.classTeacher.findUnique({
        where: {
          teacherId_classId: {
            teacherId: teacherId,
            classId: classId,
          },
        },
      }),
    );
    if (!classTeacher) {
      throw new AccessDeniedError("Teacher is not a part of this class.");
    }
  }

  // Get all students from a given class
  static async getStudentsByClass(
    classId: number,
    teacherId: number,
  ): Promise<(Student & { user: User })[]> {
    await this.verifyClassAndTeacher(classId, teacherId);

    const classStudents = await handlePrismaQuery(() =>
      prisma.classStudent.findMany({
        where: { classId },
        include: {
          student: {
            include: { user: true }, // include user details
          },
        },
      }),
    );
    return classStudents.map((cs) => cs.student);
  }

  static async addStudentToClass(
    studentId: number,
    classId: number,
  ): Promise<ClassStudent> {
    return await handlePrismaQuery(() =>
      prisma.classStudent.create({
        data: {
          studentId,
          classId,
        },
      }),
    );
  }

  // Check if student is already in the class
  static isStudentInClass(classroom: ClassWithLinks, studentId: number): void {
    const inClass: boolean = classroom.classLinks.some(
      (link: ClassStudent) => link.studentId === studentId,
    );
    if (!inClass) {
      throw new AccessDeniedError(`Student is not a part of this class.`);
    }
  }

  static alreadyMemberOfClass(
    classroom: ClassWithLinks,
    studentId: number,
  ): void {
    try {
      this.isStudentInClass(classroom, studentId);
    } catch (error) {
      if (error instanceof AccessDeniedError) {
        // Student is not in the class, so we can proceed
        return;
      }
    }
    // The student is already in the class
    throw new ConflictError(`Student is already a member of this class.`);
  }

  /*  static async removeStudentFromClass(
    studentId: number,
    classId: number
  ): Promise<ClassStudent> {
    return await handlePrismaQuery(() =>
      prisma.classStudent.delete({
        where: {
          studentId_classId: {
            studentId,
            classId,
          },
        },
      })
    );
  }*/

  // Return all classes
  /*  static async getAllClasses(): Promise<Class[]> {
    // Returns an empty array if nothing is found
    return await handlePrismaQuery(() => prisma.class.findMany());
  }*/

  // Read a class by ID
  static async getClassById(id: number): Promise<Class> {
    return await handleQueryWithExistenceCheck(
      () =>
        prisma.class.findUnique({
          where: { id: id },
        }),
      `Class not found.`,
    );
  }

  // Read a class by ID and teacher ID
  static async getClassByIdAndTeacherId(
    classId: number,
    teacherId: number,
  ): Promise<Class> {
    // Verify if the teacher is associated with the class
    await this.isTeacherOfClass(classId, teacherId);

    // Fetch the class by ID
    return await handleQueryWithExistenceCheck(
      () =>
        prisma.class.findUnique({
          where: { id: classId },
        }),
      `Class not found.`,
    );
  }

  // Give the class a new name
  /*  static async updateClassName(
    classId: number,
    newName: string
  ): Promise<Class> {
    return await handlePrismaQuery(() =>
      prisma.class.update({
        where: { id: classId },
        data: { name: newName },
      })
    );
  }*/

  // Read a class by JoinCode
  static async getClassByJoinCode(joinCode: string): Promise<ClassWithLinks> {
    if (!joinCode) {
      throw new BadRequestError(`Invalid join code: ${joinCode}.`);
    }
    return await handleQueryWithExistenceCheck(
      () =>
        prisma.class.findUnique({
          where: { code: joinCode }, // Search by the joinCode (which is 'code' in the schema)
          include: {
            classLinks: true,
          },
        }),
      `Class corresponding to join code ${joinCode} not found.`,
    );
  }

  static async getJoinCode(
    classId: number,
    teacherId: number,
  ): Promise<string> {
    const classroom = await handleQueryWithExistenceCheck(
      () =>
        prisma.class.findUnique({
          where: { id: classId },
          select: { code: true }, // Only fetch the join code
        }),
      `Class not found.`,
    );

    // Check if the teacher is associated with the class
    await this.isTeacherOfClass(classId, teacherId);

    return classroom.code;
  }

  // Function to generate a unique join code
  static async generateUniqueCode(): Promise<string> {
    let isUnique = false;
    let newJoinCode: string = "";

    while (!isUnique) {
      // Generate new join code
      newJoinCode = crypto.randomBytes(4).toString("hex");

      // Check if the code is unique in the database
      const existingClass = await handlePrismaQuery(() =>
        prisma.class.findUnique({
          where: { code: newJoinCode },
        }),
      );

      if (!existingClass) {
        isUnique = true;
      }
    }

    return newJoinCode;
  }

  // Function to regenerate the join code for a class
  static async regenerateJoinCode(
    classId: number,
    teacherId: number,
  ): Promise<string> {
    await this.verifyClassAndTeacher(classId, teacherId);

    // Generate a unique join code
    const newJoinCode = await this.generateUniqueCode();

    // Update class with the new join code
    const updatedClass = await handlePrismaQuery(() =>
      prisma.class.update({
        where: { id: classId },
        data: { code: newJoinCode },
      }),
    );

    return updatedClass.code;
  }

  // Get all classes from the same teacher
  static async getAllClassesByTeacher(
    teacherId: number,
    includeStudents: boolean = false,
  ): Promise<Class[]> {
    // Fetch all classes taught by the same teacher
    return await handlePrismaQuery(() =>
      prisma.class.findMany({
        where: {
          ClassTeacher: {
            some: {
              teacherId,
            },
          },
        },
        include: includeStudents
          ? {
              classLinks: {
                include: {
                  student: {
                    include: {
                      user: true,
                    },
                  },
                },
              },
            }
          : undefined,
      }),
    );
  }
}
