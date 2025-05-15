import { describe, it, expect, vi, beforeEach } from "vitest";
import prisma from "../../../config/prisma";
import AssignmentService from "../../../services/assignmentService";
import { NotFoundError } from "../../../errors/errors";

vi.mock("../../../config/prisma");

describe("AssignmentService.getAssignmentById", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("haalt assignment op met volledige includes", async () => {
    const mockAssignment = { id: 1, title: "Test opdracht" };
    (
      prisma.assignment.findUnique as ReturnType<typeof vi.fn>
    ).mockResolvedValue(mockAssignment);

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

  it("haalt assignment op zonder includes", async () => {
    const mockAssignment = { id: 2, title: "Minimal assignment" };
    (
      prisma.assignment.findUnique as ReturnType<typeof vi.fn>
    ).mockResolvedValue(mockAssignment);

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

  it("haalt assignment op met alleen class included", async () => {
    const mockAssignment = { id: 3 };
    (
      prisma.assignment.findUnique as ReturnType<typeof vi.fn>
    ).mockResolvedValue(mockAssignment);

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

  it("haalt assignment op met alleen teams included", async () => {
    const mockAssignment = { id: 4 };
    (
      prisma.assignment.findUnique as ReturnType<typeof vi.fn>
    ).mockResolvedValue(mockAssignment);

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

  it("gooit NotFoundError als assignment niet bestaat", async () => {
    (
      prisma.assignment.findUnique as ReturnType<typeof vi.fn>
    ).mockResolvedValue(null);

    await expect(
      AssignmentService.getAssignmentById(999, false, false),
    ).rejects.toThrow(NotFoundError);
  });

  it("bubblet een Prisma error correct", async () => {
    (
      prisma.assignment.findUnique as ReturnType<typeof vi.fn>
    ).mockRejectedValue(new Error("DB FAIL"));

    await expect(
      AssignmentService.getAssignmentById(1, true, true),
    ).rejects.toThrow("Something went wrong.");
  });

  it("roept prisma.assignment.findUnique exact één keer aan", async () => {
    (
      prisma.assignment.findUnique as ReturnType<typeof vi.fn>
    ).mockResolvedValue({ id: 123 });
    await AssignmentService.getAssignmentById(123, false, false);

    expect(prisma.assignment.findUnique).toHaveBeenCalledTimes(1);
  });

  it("gooit NotFoundError bij negatieve ID", async () => {
    (
      prisma.assignment.findUnique as ReturnType<typeof vi.fn>
    ).mockResolvedValue(null);

    await expect(
      AssignmentService.getAssignmentById(-1, false, false),
    ).rejects.toThrow(NotFoundError);
  });

  it("gooit NotFoundError bij ID = 0", async () => {
    (
      prisma.assignment.findUnique as ReturnType<typeof vi.fn>
    ).mockResolvedValue(null);

    await expect(
      AssignmentService.getAssignmentById(0, false, false),
    ).rejects.toThrow(NotFoundError);
  });
});
