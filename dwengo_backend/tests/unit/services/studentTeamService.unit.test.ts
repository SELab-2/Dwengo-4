import { Team } from "@prisma/client";
import { beforeEach, describe, expect, it, vi } from "vitest";
import StudentTeamService from "../../../services/studentTeamService";
import prisma from "../../../config/prisma";
import { NotFoundError } from "../../../errors/errors";

vi.mock("../../../config/prisma");

describe("StudentTeamService", () => {
  const mockStudentId = 1;
  const mockTeamId = 123;
  const mockAssignmentId = 456;

  const mockTeam = {
    id: mockTeamId,
    teamname: "Team Rockets",
    teamAssignment: {
      assignment: {
        id: mockAssignmentId,
        title: "Assignment X",
      },
    },
  } as Team & { teamAssignment: { assignment: { id: number; title: string } } };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getStudentTeams", () => {
    it("returns teams student is part of", async () => {
      (prisma.team.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([
        mockTeam,
      ]);

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

    it("returns empty array when student is not in any team", async () => {
      (prisma.team.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([]);

      const result = await StudentTeamService.getStudentTeams(mockStudentId);

      expect(result).toEqual([]);
    });
  });

  describe("getTeam", () => {
    it("returns the team for a student and assignment", async () => {
      const mockResponse = {
        ...mockTeam,
        students: [
          {
            userId: 1,
            user: {
              id: 1,
              email: "student@example.com",
              firstName: "Stu",
              lastName: "Dent",
            },
          },
        ],
      };

      (prisma.team.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockResponse,
      );

      const result = await StudentTeamService.getTeam(
        mockStudentId,
        mockAssignmentId,
      );

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

    it("throws NotFoundError if no team found", async () => {
      (prisma.team.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(
        null,
      );

      await expect(
        StudentTeamService.getTeam(mockStudentId, mockAssignmentId),
      ).rejects.toThrow(NotFoundError);
      await expect(
        StudentTeamService.getTeam(mockStudentId, mockAssignmentId),
      ).rejects.toThrow("Student is not part of a team for this assignment.");
    });
  });

  describe("getTeamById", () => {
    it("returns the team with full student info", async () => {
      const mockResponse = {
        id: mockTeamId,
        students: [
          {
            userId: 1,
            user: {
              id: 1,
              email: "student@example.com",
              firstName: "John",
              lastName: "Doe",
            },
          },
        ],
      };

      (prisma.team.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockResponse,
      );

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

    it("throws NotFoundError if no team found", async () => {
      (prisma.team.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(
        null,
      );

      await expect(StudentTeamService.getTeamById(mockTeamId)).rejects.toThrow(
        NotFoundError,
      );
      await expect(StudentTeamService.getTeamById(mockTeamId)).rejects.toThrow(
        "Team not found.",
      );
    });
  });
});
