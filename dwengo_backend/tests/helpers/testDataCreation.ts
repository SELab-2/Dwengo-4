import prisma from './prisma';
import { User, Class, Invite, Teacher, JoinRequestStatus } from '@prisma/client';

// helper functions to create test data in the database for tests to avoid code duplication in the tests themselves

export async function createTeacher(firstName: string, lastName: string, email: string): Promise<User & { teacher: Teacher }> {
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
    return { ...user, teacher: user.teacher! };
}

export async function createClass(name: string, code: string): Promise<Class> {
    return prisma.class.create({
        data: {
            name,
            code
        }
    });
}

export async function createInvite(teacherId: number, classId: number): Promise<Invite> {
    return prisma.invite.create({
        data: {
            teacherId,
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