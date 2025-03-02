import {PrismaClient, Teacher} from "@prisma/client";

const prisma = new PrismaClient();

export const getAllTeachers = async (): Promise<Teacher[]> => {
    return prisma.teacher.findMany({
        include: {
            user: true, // Inclusief gebruikersinformatie
        },
    });
};

export const getTeachersByClass = async (classId: number): Promise<Teacher[]> => {
    const classTeachers = await prisma.classTeacher.findMany({
        where: { classId },
        include: {
            teacher: {
                include: { user: true }, // Inclusief gebruikersinformatie
            },
        },
    });

    return classTeachers.map(ct => ct.teacher);
}