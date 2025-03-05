import { PrismaClient, Role } from "@prisma/client";

const prisma = new PrismaClient();

export const isAuthorized = async (userId: number, requiredRole: Role, classId?: number): Promise<boolean> => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { role: true, teacher: true, student: true }
    });

    if (!user) throw new Error("User not found");

    // Admins are always authorized
    if (user.role === "ADMIN") return true;

    if (requiredRole === "TEACHER" && user.role !== "TEACHER") return false;
    if (requiredRole === "STUDENT" && user.role !== "STUDENT") return false;

    // Extra check for teachers: ensure they teach this class
    if (requiredRole === "TEACHER" && classId) {
        const teachesClass = await prisma.classTeacher.findFirst({
            where: { teacherId: userId, classId }
        });
        return teachesClass !== null;
    }

    // Extra check for students: ensure they are part of this class
    if (requiredRole === "STUDENT" && classId) {
        const enrolled = await prisma.classStudent.findFirst({
            where: { studentId: userId, classId }
        });
        return enrolled !== null;
    }

    return true;
};
