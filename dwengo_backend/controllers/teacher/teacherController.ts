import {PrismaClient, Teacher} from "@prisma/client";

const prisma = new PrismaClient();

export class TeacherController {
    async findTeacherById(userId: number, inclusions: any): Promise<Teacher> {
        return prisma.teacher.findUniqueOrThrow({
            where: {userId: userId},
            include: inclusions,
        });
    }
}