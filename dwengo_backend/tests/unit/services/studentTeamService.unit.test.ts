import { beforeEach, describe, expect, test, vi } from 'vitest';
import StudentTeamService from '../../../services/studentTeamService';
import prisma from '../../../config/prisma';

vi.mock('../../../config/prisma', () => ({
  default: {
    team: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      findUnique: vi.fn(),
    },
  },
}));

describe('StudentTeamService', () => {
  const mockStudentId = 1;
  const mockTeamId = 123;
  const mockAssignmentId = 456;

  const mockTeam = {
    id: mockTeamId,
    teamname: 'Team Rockets',
    teamAssignment: {
      assignment: {
        id: mockAssignmentId,
        title: 'Assignment X',
      },
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getStudentTeams', () => {
    test('returns teams student is part of', async () => {
      (prisma.team.findMany as any).mockResolvedValue([mockTeam]);

      const result = await StudentTeamService.getStudentTeams(mockStudentId);

      expect(prisma.team.findMany).toHaveBeenCalledWith({
        where: {
          students: {
            some: { userId: mockStudentId },
          },
        },
        include: {
          teamAssignment: {
            include: {
              assignment: true,
            },
          },
        },
      });

      expect(result).toEqual([mockTeam]);
    });

    test('returns empty array when student is not in any team', async () => {
      (prisma.team.findMany as any).mockResolvedValue([]);

      const result = await StudentTeamService.getStudentTeams(mockStudentId);

      expect(result).toEqual([]);
    });
  });

  describe('getTeam', () => {
    test('returns the team for a student and assignment', async () => {
      const mockResponse = {
        ...mockTeam,
        students: [
          {
            userId: 1,
            user: {
              id: 1,
              email: 'student@example.com',
              firstName: 'Stu',
              lastName: 'Dent',
            },
          },
        ],
      };

      (prisma.team.findFirst as any).mockResolvedValue(mockResponse);

      const result = await StudentTeamService.getTeam(mockStudentId, mockAssignmentId);

      expect(prisma.team.findFirst).toHaveBeenCalledWith({
        where: {
          students: {
            some: { userId: mockStudentId },
          },
          teamAssignment: {
            assignmentId: mockAssignmentId,
          },
        },
        include: {
          students: {
            select: {
              userId: true,
              user: {
                select: {
                  id: true,
                  email: true,
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
          teamAssignment: {
            include: {
              assignment: true,
            },
          },
        },
      });

      expect(result).toEqual(mockResponse);
    });

    test('returns null if no team found', async () => {
      (prisma.team.findFirst as any).mockResolvedValue(null);

      const result = await StudentTeamService.getTeam(mockStudentId, mockAssignmentId);

      expect(result).toBeNull();
    });
  });

  describe('getTeamById', () => {
    test('returns the team with full student info', async () => {
      const mockResponse = {
        id: mockTeamId,
        students: [
          {
            userId: 1,
            user: {
              id: 1,
              email: 'student@example.com',
              firstName: 'John',
              lastName: 'Doe',
            },
          },
        ],
      };

      (prisma.team.findUnique as any).mockResolvedValue(mockResponse);

      const result = await StudentTeamService.getTeamById(mockTeamId);

      expect(prisma.team.findUnique).toHaveBeenCalledWith({
        where: { id: mockTeamId },
        include: {
          students: {
            select: {
              userId: true,
              user: {
                select: {
                  id: true,
                  email: true,
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
        },
      });

      expect(result).toEqual(mockResponse);
    });

    test('returns null if no team found', async () => {
      (prisma.team.findUnique as any).mockResolvedValue(null);

      const result = await StudentTeamService.getTeamById(mockTeamId);

      expect(result).toBeNull();
    });
  });
});
