import { PrismaClient, Role, User } from "@prisma/client";

const prisma = new PrismaClient();

export const findUser = async (email: string): Promise<User | null> => {
  return prisma.user.findUnique({ where: { email } });
};

export const createUser = async (
  firstName: string,
  lastName: string,
  email: string,
  hashedPassword: string,
  role: Role
): Promise<User> => {
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
};

export const findUserByEmail = async (email: string): Promise<User> => {
  return prisma.user.findUniqueOrThrow({ where: { email } });
};
