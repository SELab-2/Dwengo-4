import { describe, it, expect, vi, beforeEach } from 'vitest';
import StudentService from '../../../services/studentService';
import prisma from '../../../config/prisma';

vi.mock('../../../config/prisma');

describe('StudentService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // === findStudentById ===
  describe('findStudentById', () => {
    it('retourneert student met gekoppelde user als ID bestaat', async () => {
      const mockStudent = {
        userId: 1,
        user: {
          email: 'student@example.com',
        },
      };
      (prisma.student.findUniqueOrThrow as ReturnType<typeof vi.fn>).mockResolvedValue(mockStudent);

      const result = await StudentService.findStudentById(1);
      expect(result).toEqual(mockStudent);
      expect(prisma.student.findUniqueOrThrow).toHaveBeenCalledWith({
        where: { userId: 1 },
        include: { user: true },
      });
    });

    it('gooit error door als student niet gevonden wordt', async () => {
      (prisma.student.findUniqueOrThrow as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Not found'));

      await expect(StudentService.findStudentById(999)).rejects.toThrow('Not found');
    });
  });

  // === getStudentsByClass ===
  describe('getStudentsByClass', () => {
    it('retourneert studenten gekoppeld aan klas', async () => {
      const classData = {
        classLinks: [
          { student: { userId: 1, user: { email: 's1@test.com' } } },
          { student: { userId: 2, user: { email: 's2@test.com' } } },
        ],
      };

      (prisma.class.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(classData);

      const result = await StudentService.getStudentsByClass(100);

      expect(result).toEqual([
        { userId: 1, user: { email: 's1@test.com' } },
        { userId: 2, user: { email: 's2@test.com' } },
      ]);

      expect(prisma.class.findUnique).toHaveBeenCalledWith({
        where: { id: 100 },
        include: {
          classLinks: {
            include: {
              student: {
                include: {
                  user: true,
                },
              },
            },
          },
        },
      });
    });

    it('gooit error als klas niet bestaat', async () => {
      (prisma.class.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(null);

      await expect(StudentService.getStudentsByClass(999)).rejects.toThrow(
        'Class with ID: 999 not found'
      );
    });
  });

  // === getStudentsByTeamAssignment ===
  describe('getStudentsByTeamAssignment', () => {
    it('retourneert studenten die deel uitmaken van team & assignment', async () => {
      const mockStudents = [
        { userId: 1, user: { email: 's1@test.com' } },
        { userId: 2, user: { email: 's2@test.com' } },
      ];

      (prisma.student.findMany as ReturnType<typeof vi.fn>).mockResolvedValue(mockStudents);

      const result = await StudentService.getStudentsByTeamAssignment(10, 20);

      expect(result).toEqual(mockStudents);

      expect(prisma.student.findMany).toHaveBeenCalledWith({
        where: {
          Team: {
            some: {
              id: 20,
              teamAssignment: {
                assignmentId: 10,
              },
            },
          },
        },
        include: {
          user: true,
        },
      });
    });

    it('retourneert lege array als geen matches zijn', async () => {
      (prisma.student.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([]);

      const result = await StudentService.getStudentsByTeamAssignment(999, 888);
      expect(result).toEqual([]);
    });

    it('gooit error als prisma faalt', async () => {
      (prisma.student.findMany as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Query failed'));

      await expect(StudentService.getStudentsByTeamAssignment(1, 2)).rejects.toThrow('Query failed');
    });
  });
});
