import {PrismaClient, Teacher} from "@prisma/client";

const prisma = new PrismaClient();

export const findTeacherById = async (userId: number, inclusions: any): Promise<Teacher> => {
    return prisma.teacher.findUniqueOrThrow({
        where: {userId: userId},
        include: inclusions,
    });
}

export const getAllTeachers = async (): Promise<Teacher[]> => {
    return prisma.teacher.findMany({
        include: {
            user: true, // Inclusief gebruikersinformatie
        },
    });
};

export const getTeachersByClass = async (classId: number): Promise<Teacher[]> => {
    return prisma.teacher.findMany({
        where: {
            teaches: {
                some: {classId}, // Find teachers who are linked to this class
            },
        },
        include: {
            user: true // Includes full user data in each teacher object
        },
    });
}