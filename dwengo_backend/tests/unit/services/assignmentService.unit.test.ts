import { describe, it, expect, vi, beforeEach } from 'vitest';
import prisma from '../../../config/prisma';
import AssignmentService from '../../../services/assignmentService';

vi.mock('../../../config/prisma');

describe('AssignmentService.getAssignmentById', () => {
  beforeEach(() => {
    // Mocks worden automatisch gereset door beforeEach in __mocks__/prisma.ts
  });

  it('haalt assignment op met volledige includes', async () => {
    const mockAssignment = { id: 1, title: 'Test opdracht' };
    (prisma.assignment.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(mockAssignment);

    const result = await AssignmentService.getAssignmentById(1, true, true);

    expect(prisma.assignment.findUnique).toHaveBeenCalledWith({
      where: { id: 1 },
      include: {
        classAssignments: { include: { class: true } },
        teamAssignments: {
          include: {
            team: {
              include: {
                students: {
                  include: {
                    user: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    expect(result).toEqual(mockAssignment);
  });

  it('haalt assignment op zonder includes', async () => {
    const mockAssignment = { id: 2, title: 'Minimal assignment' };
    (prisma.assignment.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(mockAssignment);

    const result = await AssignmentService.getAssignmentById(2, false, false);

    expect(prisma.assignment.findUnique).toHaveBeenCalledWith({
      where: { id: 2 },
      include: {
        classAssignments: { include: { class: false } },
        teamAssignments: {
          include: {
            team: {
              include: {
                students: {
                  include: {
                    user: false,
                  },
                },
              },
            },
          },
        },
      },
    });

    expect(result).toEqual(mockAssignment);
  });

  it('haalt assignment op met alleen class included', async () => {
    const mockAssignment = { id: 3 };
    (prisma.assignment.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(mockAssignment);

    const result = await AssignmentService.getAssignmentById(3, true, false);

    expect(prisma.assignment.findUnique).toHaveBeenCalledWith({
      where: { id: 3 },
      include: {
        classAssignments: { include: { class: true } },
        teamAssignments: {
          include: {
            team: {
              include: {
                students: {
                  include: {
                    user: false,
                  },
                },
              },
            },
          },
        },
      },
    });

    expect(result).toEqual(mockAssignment);
  });

  it('haalt assignment op met alleen teams included', async () => {
    const mockAssignment = { id: 4 };
    (prisma.assignment.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(mockAssignment);

    const result = await AssignmentService.getAssignmentById(4, false, true);

    expect(prisma.assignment.findUnique).toHaveBeenCalledWith({
      where: { id: 4 },
      include: {
        classAssignments: { include: { class: false } },
        teamAssignments: {
          include: {
            team: {
              include: {
                students: {
                  include: {
                    user: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    expect(result).toEqual(mockAssignment);
  });

  it('geeft null terug als assignment niet bestaat', async () => {
    (prisma.assignment.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(null);

    const result = await AssignmentService.getAssignmentById(999, false, false);
    expect(result).toBeNull();
  });

  it('bubblet een Prisma error correct', async () => {
    (prisma.assignment.findUnique as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('DB FAIL'));

    await expect(() =>
      AssignmentService.getAssignmentById(1, true, true)
    ).rejects.toThrow('DB FAIL');
  });

  it('roept prisma.assignment.findUnique exact één keer aan', async () => {
    (prisma.assignment.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({ id: 123 });
    await AssignmentService.getAssignmentById(123, false, false);

    expect(prisma.assignment.findUnique).toHaveBeenCalledTimes(1);
  });

  it('werkt met negatieve ID (Prisma faalt niet, maar geeft null)', async () => {
    (prisma.assignment.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(null);
    const result = await AssignmentService.getAssignmentById(-1, false, false);
    expect(result).toBeNull();
  });

  it('werkt met ID = 0 (Prisma faalt niet, maar geeft null)', async () => {
    (prisma.assignment.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(null);
    const result = await AssignmentService.getAssignmentById(0, false, false);
    expect(result).toBeNull();
  });
});
