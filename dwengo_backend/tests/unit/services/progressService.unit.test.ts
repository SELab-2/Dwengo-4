import { describe, it, expect, beforeEach, vi } from "vitest";
import prisma from "../../../config/prisma";
import ProgressService from "../../../services/progressService";
import { NotFoundError } from "../../../errors/errors";

vi.mock("../../../config/prisma");

describe("ProgressService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createProgress", () => {
    it("should create progress and studentProgress in a transaction", async () => {
      const fakeProgress = { id: 1, learningObjectId: "lo1", done: false };

      prisma.$transaction.mockImplementationOnce(async (callback: any) =>
        callback({
          learningObjectProgress: {
            create: vi.fn().mockResolvedValue(fakeProgress),
          },
          studentProgress: { create: vi.fn().mockResolvedValue({}) },
        }),
      );

      const result = await ProgressService.createProgress(5, "lo1");
      expect(result).toEqual(fakeProgress);
    });

    it("should throw error if transaction fails", async () => {
      prisma.$transaction.mockRejectedValueOnce(new Error("DB Error"));
      await expect(ProgressService.createProgress(5, "lo1")).rejects.toThrow(
        "Something went wrong.",
      );
    });
  });

  describe("getStudentProgress", () => {
    it("should return the progress object when found", async () => {
      const mockResult = {
        studentId: 3,
        progressId: 1,
        progress: { id: 1, learningObjectId: "lo1", done: false },
      } as any;

      prisma.studentProgress.findFirst.mockResolvedValue(mockResult);

      const result = await ProgressService.getStudentProgress(3, "lo1");
      expect(result).toEqual(mockResult.progress);
    });

    it("should throw NotFoundError if no progress found", async () => {
      prisma.studentProgress.findFirst.mockResolvedValue(null);
      await expect(
        ProgressService.getStudentProgress(999, "xyz"),
      ).rejects.toThrow(NotFoundError);
      await expect(
        ProgressService.getStudentProgress(999, "xyz"),
      ).rejects.toThrow("Progress not found.");
    });
  });

  describe("updateProgressToDone", () => {
    it("should update progress to done=true", async () => {
      const mockUpdate = { id: 1, learningObjectId: "lo1", done: true };
      prisma.learningObjectProgress.update.mockResolvedValue(mockUpdate);

      const result = await ProgressService.updateProgressToDone(1);
      expect(result).toEqual(mockUpdate);
    });

    it("should throw error if update fails", async () => {
      prisma.learningObjectProgress.update.mockRejectedValueOnce(
        new Error("fail"),
      );
      await expect(ProgressService.updateProgressToDone(1)).rejects.toThrow(
        "Something went wrong.",
      );
    });
  });

  describe("getTeamWithAssignment", () => {
    it("should return team with assignment", async () => {
      const team = {
        id: 1,
        teamname: "Team A",
        classId: 10,
        students: [],
        teamAssignment: { assignmentId: 5, teamId: 1 },
      } as any;
      prisma.team.findUnique.mockResolvedValue(team);

      const result = await ProgressService.getTeamWithAssignment(1);
      expect(result).toEqual(team);
    });

    it("should throw NotFoundError if team not found", async () => {
      prisma.team.findUnique.mockResolvedValue(null);
      await expect(ProgressService.getTeamWithAssignment(999)).rejects.toThrow(
        NotFoundError,
      );
      await expect(ProgressService.getTeamWithAssignment(999)).rejects.toThrow(
        '"Team assignment not found.',
      );
    });
  });

  describe("getAssignment", () => {
    it("should return assignment by ID", async () => {
      const assignment = {
        id: 3,
        title: "Test assignment",
        description: "desc",
        pathRef: "somePath",
        isExternal: false,
        deadline: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any;
      prisma.assignment.findUnique.mockResolvedValue(assignment);

      const result = await ProgressService.getAssignment(3);
      expect(result).toEqual(assignment);
    });
  });

  describe("countNodesInPath", () => {
    it("should return number of nodes for learningPathId", async () => {
      prisma.learningPathNode.count.mockResolvedValue(7);
      const result = await ProgressService.countNodesInPath("path1");
      expect(result).toBe(7);
    });

    it("should throw NotFoundError if count is zero", async () => {
      prisma.learningPathNode.count.mockResolvedValue(0);
      await expect(ProgressService.countNodesInPath("empty")).rejects.toThrow(
        NotFoundError,
      );
      await expect(ProgressService.countNodesInPath("empty")).rejects.toThrow(
        "Learning path not found.",
      );
    });
  });

  describe("getLocalObjectIdsInPath", () => {
    it("should return filtered list of localLearningObjectId's", async () => {
      prisma.learningPathNode.findMany.mockResolvedValue([
        { localLearningObjectId: "lo1" },
        { localLearningObjectId: null },
        { localLearningObjectId: "lo2" },
      ]);

      const result = await ProgressService.getLocalObjectIdsInPath("p123");
      expect(result).toEqual(["lo1", "lo2"]);
    });

    it("should return empty list if no matches", async () => {
      prisma.learningPathNode.findMany.mockResolvedValue([]);
      const result = await ProgressService.getLocalObjectIdsInPath("p-empty");
      expect(result).toEqual([]);
    });
  });

  describe("countDoneProgressForStudent", () => {
    it("should count done progress for student in objectIds", async () => {
      prisma.studentProgress.count.mockResolvedValue(3);
      const result = await ProgressService.countDoneProgressForStudent(7, [
        "a",
        "b",
      ]);
      expect(result).toBe(3);
    });
  });

  describe("getTeamsForAssignment", () => {
    it("should get all team assignments with teams and students", async () => {
      const fakeTeams = [
        {
          assignmentId: 22,
          teamId: 1,
          team: { id: 1, teamname: "Mock Team", classId: 101, students: [] },
        },
      ];
      prisma.teamAssignment.findMany.mockResolvedValue(fakeTeams);

      const result = await ProgressService.getTeamsForAssignment(22);
      expect(result).toEqual(fakeTeams);
    });
  });
});
