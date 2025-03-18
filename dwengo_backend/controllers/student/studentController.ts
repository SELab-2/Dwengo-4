import {PrismaClient, Student} from "@prisma/client";

const prisma = new PrismaClient();

export class StudentController {
    async findStudentById(userId: number, inclusions: any): Promise<Student> {
        return prisma.student.findUniqueOrThrow({
            where: {userId: userId},
            include: inclusions,
        });
    }
}