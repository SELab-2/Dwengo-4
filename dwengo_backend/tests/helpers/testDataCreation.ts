import prisma from './prisma';
import { User, Class, Invite, Teacher, JoinRequestStatus, Student, JoinRequest } from '@prisma/client';
import * as jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

// helper functions to create test data in the database for tests to avoid code duplication in the tests themselves

export async function createTeacher(firstName: string, lastName: string, email: string): Promise<User & { teacher: Teacher, token: string }> {
    const user = await prisma.user.create({
        data: {
            firstName,
            lastName,
            email,
            password: "testpassword",
            role: "TEACHER",
            teacher: {
                create: {}
            }
        },
        include: {
            teacher: true
        }
    });
    const token: string = jwt.sign({ id: user.id }, process.env.JWT_SECRET as string, {
        expiresIn: '1h',
      });
    return { ...user, teacher: user.teacher!, token };
}

export async function createStudent(firstName: string, lastName: string, email: string): Promise<User & { student: Student, token: string }> {
    const user = await prisma.user.create({
        data: {
            firstName,
            lastName,
            email,
            password: "testpassword",
            role: "STUDENT",
            student: {
                create: {}
            }
        },
        include: {
            student: true
        }
    });
    const token: string = jwt.sign({ id: user.id }, process.env.JWT_SECRET as string, {
        expiresIn: '1h',
      });
    return { ...user, student: user.student!, token };
}

export async function createClass(name: string, code: string): Promise<Class> {
    return prisma.class.create({
        data: {
            name,
            code
        }
    });
}

export async function createInvite(classTeacherId: number, otherTeacherId: number, classId: number): Promise<Invite> {
    return prisma.invite.create({
        data: {
            otherTeacherId,
            classTeacherId,
            classId,
            status: JoinRequestStatus.PENDING
        }
    });
}

export async function addTeacherToClass(teacherId: number, classId: number): Promise<void> {
    await prisma.classTeacher.create({
        data: {
            teacherId,
            classId
        }
    });
}

export async function addStudentToClass(studentId: number, classId: number): Promise<void> {
    await prisma.classStudent.create({
        data: {
            studentId,
            classId
        }
    });
}

export async function createJoinRequest(studentId: number, classId: number): Promise<JoinRequest> {
    return await prisma.joinRequest.create({
        data: {
            studentId,
            classId,
            status: JoinRequestStatus.PENDING
        }
    });
}
