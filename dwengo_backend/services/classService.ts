import {
  Class,
  ClassStudent,
  ClassTeacher,
  Student,
  User,
} from "@prisma/client";
import crypto from "crypto";
import {
  AccesDeniedError,
  BadRequestError,
  NotFoundError,
} from "../errors/errors";

import prisma from "../config/prisma";

export type ClassWithLinks = Class & { classLinks: ClassStudent[] };

export default class ClassService {
  static async createClass(name: string, teacherId: number): Promise<Class> {
    // Generate a unique join code (e.g., an 8-digit hex string)
    const joinCode = await this.generateUniqueCode();

    const classroom = await prisma.class.create({
      data: {
        name: name, // name field matches the Class schema
        code: joinCode, // code field matches the Class schema
      },
    });

    // Now that you have the class id, create the ClassTeacher record
    await prisma.classTeacher.create({
      data: {
        teacherId: teacherId, // teacherId links to the teacher record
        classId: classroom.id, // Use the id of the newly created class
      },
    });

    return classroom;
  }

  // this function checks if the class exists and if the teacher is associated with the class
  // if either of these conditions are not met, an error is thrown
  private static async verifyClassAndTeacher(
    classId: number,
    teacherId: number,
  ): Promise<void> {
    // Check if the class exists
    const classroom = await prisma.class.findUnique({
      where: { id: classId },
    });
    if (!classroom) {
      throw new NotFoundError(`Class with id ${classId} not found`);
    }

    // Check if the teacher is associated with the class
    const isTeacher = await this.isTeacherOfClass(classId, teacherId);
    if (!isTeacher) {
      throw new AccesDeniedError(
        `Acces denied: Teacher ${teacherId} is not part of class ${classId}`,
      );
    }
    return;
  }

  // Delete a class by ID
  static async deleteClass(classId: number, teacherId: number): Promise<Class> {
    await this.verifyClassAndTeacher(classId, teacherId);
    return await prisma.class.delete({ where: { id: classId } }); // onDelete: Cascade in the prisma schema makes sure that all related records are also deleted
  }

  // Get all classes taught by a given teacher
  static async getClassesByTeacher(teacherId: number): Promise<Class[]> {
    // Fetch all classes where the teacher is assigned
    return prisma.class.findMany({
      where: {
        ClassTeacher: {
          some: {
            teacherId: teacherId, // Filter for the given teacherId
          },
        },
      },
    });
  }

  // Get all classes a student is partaking in
  static async getClassesByStudent(studentId: number): Promise<Class[]> {
    // Fetch all classes where the student is enrolled
    return prisma.class.findMany({
      where: {
        classLinks: {
          some: {
            studentId: studentId, // Filter for the given studentId
          },
        },
      },
    });
  }

  static async getStudentClassByClassId(
    studentId: number,
    classId: number,
  ): Promise<Class | null> {
    // Fetch all classes where the student is enrolled
    return prisma.class.findUnique({
      where: {
        id: classId,
        classLinks: {
          some: {
            studentId: studentId, // Filter for the given studentId
          },
        },
      },
    });
  }

  static async leaveClassAsStudent(
    studentId: number,
    classId: number,
  ): Promise<ClassStudent> {
    return prisma.classStudent.delete({
      where: {
        studentId_classId: {
          studentId: studentId,
          classId: classId,
        },
      },
    });
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
  ): Promise<boolean> {
    const classTeacher: ClassTeacher | null =
      await prisma.classTeacher.findUnique({
        where: {
          teacherId_classId: {
            teacherId: teacherId,
            classId: classId,
          },
        },
      });
    return classTeacher !== null;
  }

  // Get all students from a given class
  static async getStudentsByClass(
    classId: number,
    teacherId: number,
  ): Promise<(Student & { user: User })[]> {
    await this.verifyClassAndTeacher(classId, teacherId);

    const classStudents = await prisma.classStudent.findMany({
      where: { classId },
      include: {
        student: {
          include: { user: true }, // include user details
        },
      },
    });
    return classStudents.map((cs) => cs.student);
  }

  static async addStudentToClass(
    studentId: number,
    classId: number,
  ): Promise<ClassStudent> {
    return prisma.classStudent.create({
      data: {
        studentId,
        classId,
      },
    });
  }

  // Check if student is already in the class
  static async isStudentInClass(
    classroom: ClassWithLinks,
    studentId: number,
  ): Promise<boolean> {
    return classroom.classLinks.some(
      (link: ClassStudent) => link.studentId === studentId,
    );
  }

  static async removeStudentFromClass(
    studentId: number,
    classId: number,
  ): Promise<ClassStudent> {
    return prisma.classStudent.delete({
      where: {
        studentId_classId: {
          studentId,
          classId,
        },
      },
    });
  }

  // Return all classes
  static async getAllClasses(): Promise<Class[]> {
    // Returns an empty array if nothing is found
    return prisma.class.findMany();
  }

  // Read a class by ID
  static async getClassById(id: number): Promise<Class | null> {
    return prisma.class.findUnique({
      where: { id: id },
    });
  }

  // Read a class by ID and teacher ID
  static async getClassByIdAndTeacherId(
    classId: number,
    teacherId: number,
  ): Promise<Class | null> {
    // Verify if the teacher is associated with the class
    const isTeacher = await this.isTeacherOfClass(classId, teacherId);
    if (!isTeacher) {
      throw new AccesDeniedError(
        `Access denied: Teacher ${teacherId} is not part of class ${classId}`,
      );
    }

    // Fetch the class by ID
    return prisma.class.findUnique({
      where: { id: classId },
    });
  }

  // Give the class a new name
  static async updateClassName(
    classId: number,
    newName: string,
  ): Promise<Class> {
    return prisma.class.update({
      where: { id: classId },
      data: { name: newName },
    });
  }

  // Read a class by JoinCode
  static async getClassByJoinCode(
    joinCode: string,
  ): Promise<ClassWithLinks | null> {
    if (!joinCode) {
      throw new BadRequestError(`Invalid join code: ${joinCode}`);
    }
    return prisma.class.findUnique({
      where: { code: joinCode }, // Search by the joinCode (which is 'code' in the schema)
      include: {
        classLinks: true,
      },
    });
  }

  static async getJoinCode(
    classId: number,
    teacherId: number,
  ): Promise<string> {
    const classroom = await prisma.class.findUnique({
      where: { id: classId },
      select: { code: true }, // Only fetch the join code
    });
    if (!classroom) {
      throw new NotFoundError(`Class with id ${classId} not found`);
    }

    // Check if the teacher is associated with the class
    const isTeacher = await this.isTeacherOfClass(classId, teacherId);
    if (!isTeacher) {
      throw new AccesDeniedError(
        `Acces denied: Teacher ${teacherId} is not part of class ${classId}`,
      );
    }

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
      const existingClass = await prisma.class.findUnique({
        where: { code: newJoinCode },
      });

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
    const updatedClass = await prisma.class.update({
      where: { id: classId },
      data: { code: newJoinCode },
    });

    return updatedClass.code;
  }

  // Get all classes from the same teacher
  static async getAllClassesByTeacher(
    teacherId: number,
    includeStudents: boolean = false,
  ): Promise<Class[]> {
    // Fetch all classes taught by the same teacher
    return prisma.class.findMany({
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
    });
  }
}
