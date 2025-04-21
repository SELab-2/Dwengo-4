import { describe, it, expect, vi, beforeEach } from 'vitest';
import TeacherService from '../../../services/teacherService';
import prisma from '../../../config/prisma';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

vi.mock('../../../config/prisma', () => ({
  default: {
    teacher: {
      findUniqueOrThrow: vi.fn(),
      findMany: vi.fn(),
    },
  },
}));

describe('TeacherService', () => {
  const mockUser = { id: 1, email: 'teacher@test.com', firstName: 'Jan', lastName: 'Tester' };
  const mockTeacher = { userId: 1, user: mockUser };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('findTeacherById', () => {
    it('should return a teacher with user info when found', async () => {
      (prisma.teacher.findUniqueOrThrow as any).mockResolvedValue(mockTeacher);

      const result = await TeacherService.findTeacherById(1);

      expect(result).toEqual(mockTeacher);
      expect(prisma.teacher.findUniqueOrThrow).toHaveBeenCalledWith({
        where: { userId: 1 },
        include: { user: true },
      });
    });

    it('should throw an error when teacher not found', async () => {
      const error = new PrismaClientKnownRequestError('Not found', {
        clientVersion: '4.0.0',
        code: 'P2025',
        meta: {
          target: 'userId',
        },
      });
      (prisma.teacher.findUniqueOrThrow as any).mockRejectedValue(error);

      await expect(TeacherService.findTeacherById(999)).rejects.toThrow('Not found');
    });
  });

  describe('getAllTeachers', () => {
    it('should return all teachers including user info', async () => {
      const teachers = [
        { userId: 1, user: mockUser },
        { userId: 2, user: { ...mockUser, id: 2, email: 'another@test.com' } },
      ];
      (prisma.teacher.findMany as any).mockResolvedValue(teachers);

      const result = await TeacherService.getAllTeachers();

      expect(result).toEqual(teachers);
      expect(prisma.teacher.findMany).toHaveBeenCalledWith({
        include: { user: true },
      });
    });

    it('should return an empty array if no teachers exist', async () => {
      (prisma.teacher.findMany as any).mockResolvedValue([]);

      const result = await TeacherService.getAllTeachers();

      expect(result).toEqual([]);
    });
  });

  describe('getTeachersByClass', () => {
    it('should return all teachers linked to a given classId', async () => {
      const classId = 10;
      const teachers = [
        { userId: 1, user: mockUser },
        { userId: 2, user: { ...mockUser, id: 2, email: 'linked@test.com' } },
      ];
      (prisma.teacher.findMany as any).mockResolvedValue(teachers);

      const result = await TeacherService.getTeachersByClass(classId);

      expect(result).toEqual(teachers);
      expect(prisma.teacher.findMany).toHaveBeenCalledWith({
        where: {
          teaches: {
            some: { classId },
          },
        },
        include: {
          user: true,
        },
      });
    });

    it('should return empty array if no teachers are linked to the class', async () => {
      (prisma.teacher.findMany as any).mockResolvedValue([]);

      const result = await TeacherService.getTeachersByClass(999);

      expect(result).toEqual([]);
    });
  });
});
