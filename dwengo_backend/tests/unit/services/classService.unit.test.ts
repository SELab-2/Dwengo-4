import { Class, ClassStudent } from "@prisma/client";
import crypto from "crypto";
import {
  AccessDeniedError,
  BadRequestError,
  NotFoundError,
} from "../../../errors/errors";
import { handlePrismaQuery } from "../../../errors/errorFunctions";
import prisma from "../../../config/prisma";

export type ClassWithLinks = Class & { classLinks: ClassStudent[] };

export default class ClassService {
  static async createClass(name: string, teacherId: number): Promise<Class> {
    const joinCode = await this.generateUniqueCode();
    const createdClass = await prisma.class.create({
      data: {
        name,
        code: joinCode,
      },
    });
    await prisma.classTeacher.create({
      data: {
        teacherId,
        classId: createdClass.id,
      },
    });
    return createdClass;
  }

  private static async verifyClassAndTeacher(
    classId: number,
    teacherId: number,
  ): Promise<void> {
    const c = await prisma.class.findUnique({ where: { id: classId } });
    if (!c) {
      throw new NotFoundError("Class not found.");
    }
    const isTeacher = await this.isTeacherOfClass(classId, teacherId);
    if (!isTeacher) {
      throw new AccessDeniedError("Teacher is not a part of this class.");
    }
  }

  static async deleteClass(classId: number, teacherId: number): Promise<Class> {
    await this.verifyClassAndTeacher(classId, teacherId);
    return handlePrismaQuery(() =>
      prisma.class.delete({ where: { id: classId } }),
    );
  }

  static async getClassesByTeacher(teacherId: number): Promise<Class[]> {
    return handlePrismaQuery(() =>
      prisma.class.findMany({
        where: {
          ClassTeacher: { some: { teacherId } },
        },
      }),
    );
  }

  static async getClassesByStudent(studentId: number): Promise<Class[]> {
    return handlePrismaQuery(() =>
      prisma.class.findMany({
        where: {
          classLinks: { some: { studentId } },
        },
      }),
    );
  }

  static async leaveClassAsStudent(
    studentId: number,
    classId: number,
  ): Promise<ClassStudent> {
    const inClass = await prisma.classStudent.findUnique({
      where: { studentId_classId: { studentId, classId } },
    });
    if (!inClass) {
      throw new BadRequestError(
        "Student is not a part of this class and is therefore not able to leave it.",
      );
    }
    return handlePrismaQuery(() =>
      prisma.classStudent.delete({
        where: { studentId_classId: { studentId, classId } },
      }),
    );
  }

  static async updateClass(
    classId: number,
    teacherId: number,
    name: string,
  ): Promise<Class> {
    await this.verifyClassAndTeacher(classId, teacherId);
    return handlePrismaQuery(() =>
      prisma.class.update({ where: { id: classId }, data: { name } }),
    );
  }

  static async getJoinCode(
    classId: number,
    teacherId: number,
  ): Promise<string> {
    const c = await prisma.class.findUnique({
      where: { id: classId },
      select: { code: true },
    });
    if (!c) {
      throw new NotFoundError("Class not found.");
    }
    const isTeacher = await this.isTeacherOfClass(classId, teacherId);
    if (!isTeacher) {
      throw new AccessDeniedError("Teacher is not a part of this class.");
    }
    return c.code;
  }

  static async generateUniqueCode(): Promise<string> {
    let newJoinCode: string;
    do {
      newJoinCode = crypto.randomBytes(4).toString("hex");
    } while (await prisma.class.findUnique({ where: { code: newJoinCode } }));
    return newJoinCode;
  }

  static async getClassByJoinCode(joinCode: string): Promise<ClassWithLinks> {
    if (!joinCode) {
      throw new BadRequestError(`Invalid join code: ${joinCode}.`);
    }
    const c = await prisma.class.findUnique({
      where: { code: joinCode },
      include: { classLinks: true },
    });
    if (!c) {
      throw new NotFoundError(
        `Class corresponding to join code ${joinCode} not found.`,
      );
    }
    return c;
  }

  static async isTeacherOfClass(
    classId: number,
    teacherId: number,
  ): Promise<boolean> {
    const ct = await prisma.classTeacher.findUnique({
      where: { teacherId_classId: { teacherId, classId } },
    });
    return !!ct;
  }

  static isStudentInClass(
    classroom: ClassWithLinks,
    studentId: number,
  ): boolean {
    return classroom.classLinks.some((link) => link.studentId === studentId);
  }

  static async removeStudentFromClass(
    studentId: number,
    classId: number,
  ): Promise<ClassStudent> {
    return handlePrismaQuery(() =>
      prisma.classStudent.delete({
        where: { studentId_classId: { studentId, classId } },
      }),
    );
  }
}
