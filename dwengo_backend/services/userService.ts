import { PrismaClient, Role, Student, Teacher, User } from "@prisma/client";

const prisma = new PrismaClient();

export default class UserService {
    static async findUser(email: string): Promise<User | null> {
        return prisma.user.findUnique({ where: { email } });
    }

    static async createUser(
        firstName: string,
        lastName: string,
        email: string,
        hashedPassword: string,
        role: Role
    ): Promise<User> {
        return prisma.user.create({
            data: {
                firstName,
                lastName,
                email,
                password: hashedPassword,
                role: role,
                // This immediately creates the teacher/student/admin records as well
                teacher: role === Role.TEACHER ? { create: {} } : undefined,
                student: role === Role.STUDENT ? { create: {} } : undefined,
                admin: role === Role.ADMIN ? { create: {} } : undefined,
            },
            include: {
                teacher: true,
                student: true,
                admin: true,
            },
        });
    }

    static async findUserByEmail(email: string): Promise<User> {
        return prisma.user.findUniqueOrThrow({ where: { email } });
    }

    static async findTeacherUserById(userId: number): Promise<(Teacher & { user: User }) | null> {
        return prisma.teacher.findUnique({
            where: { userId },
            include: { user: true },
        });
    }

    static async findStudentUserById(userId: number): Promise<(Student & { user: User }) | null> {
        return prisma.student.findUnique({
            where: { userId },
            include: { user: true },
        });
    }
}
