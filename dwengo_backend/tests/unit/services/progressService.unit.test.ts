import ProgressService from "../../../services/progressService";
import { PrismaClient } from "@prisma/client";
import { vi, describe, it, expect, beforeEach } from "vitest";

// Mock Prisma Client with correct typings
vi.mock("@prisma/client", async () => {
  const actual = await vi.importActual<typeof import("@prisma/client")>("@prisma/client");

  const mockPrisma = {
    $transaction: vi.fn(),
    learningObjectProgress: {
      create: vi.fn(),
      update: vi.fn(),
    },
    studentProgress: {
      create: vi.fn(),
      findFirst: vi.fn(),
      count: vi.fn(),
    },
    team: {
      findUnique: vi.fn(),
    },
    assignment: {
      findUnique: vi.fn(),
    },
    learningPathNode: {
      count: vi.fn(),
      findMany: vi.fn(),
    },
    teamAssignment: {
      findMany: vi.fn(),
    },
  };

  return {
    ...actual,
    PrismaClient: vi.fn(() => mockPrisma),
  };
});

// 🧪 Recast the mocked client with proper typing
const prisma = new PrismaClient() as unknown as {
  $transaction: ReturnType<typeof vi.fn>;
  learningObjectProgress: {
    create: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
  };
  studentProgress: {
    create: ReturnType<typeof vi.fn>;
    findFirst: ReturnType<typeof vi.fn>;
    count: ReturnType<typeof vi.fn>;
  };
  team: {
    findUnique: ReturnType<typeof vi.fn>;
  };
  assignment: {
    findUnique: ReturnType<typeof vi.fn>;
  };
  learningPathNode: {
    count: ReturnType<typeof vi.fn>;
    findMany: ReturnType<typeof vi.fn>;
  };
  teamAssignment: {
    findMany: ReturnType<typeof vi.fn>;
  };
};

describe("ProgressService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createProgress", () => {
    it("should create progress and studentProgress in a transaction", async () => {
      const fakeProgress = { id: 1, learningObjectId: "lo1", done: false };

      prisma.$transaction = vi.fn().mockImplementation(async (fn: any) => {
        return fn({
          learningObjectProgress: {
            create: vi.fn().mockResolvedValue(fakeProgress),
          },
          studentProgress: {
            create: vi.fn().mockResolvedValue({}),
          },
        });
      });

      const result = await ProgressService.createProgress(5, "lo1");
      expect(result).toEqual(fakeProgress);
    });

    it("should throw if transaction fails", async () => {
      prisma.$transaction = vi.fn().mockRejectedValueOnce(new Error("DB Error"));
      await expect(ProgressService.createProgress(5, "lo1")).rejects.toThrow("DB Error");
    });
  });

  describe("getStudentProgress", () => {
    it("should return student progress with progress included", async () => {
      const mockResult = { progress: { done: false }, studentId: 3 };
      prisma.studentProgress.findFirst.mockResolvedValue(mockResult);

      const result = await ProgressService.getStudentProgress(3, "lo1");
      expect(result).toEqual(mockResult);
    });

    it("should return null if no progress found", async () => {
      prisma.studentProgress.findFirst.mockResolvedValue(null);
      const result = await ProgressService.getStudentProgress(999, "xyz");
      expect(result).toBeNull();
    });
  });

  describe("updateProgressToDone", () => {
    it("should update progress to done=true", async () => {
      const mockUpdate = { id: 1, done: true };
      prisma.learningObjectProgress.update.mockResolvedValue(mockUpdate);

      const result = await ProgressService.updateProgressToDone(1);
      expect(result).toEqual(mockUpdate);
    });

    it("should throw if update fails", async () => {
      prisma.learningObjectProgress.update.mockRejectedValueOnce(new Error("fail"));
      await expect(ProgressService.updateProgressToDone(1)).rejects.toThrow("fail");
    });
  });

  describe("getTeamWithAssignment", () => {
    it("should return team with assignment", async () => {
      const team = { id: 1, students: [], teamAssignment: {} };
      prisma.team.findUnique.mockResolvedValue(team);

      const result = await ProgressService.getTeamWithAssignment(1);
      expect(result).toEqual(team);
    });

    it("should return null if team not found", async () => {
      prisma.team.findUnique.mockResolvedValue(null);
      const result = await ProgressService.getTeamWithAssignment(999);
      expect(result).toBeNull();
    });
  });

  describe("getAssignment", () => {
    it("should return assignment by ID", async () => {
      prisma.assignment.findUnique.mockResolvedValue({ id: 3 });
      const result = await ProgressService.getAssignment(3);
      expect(result).toEqual({ id: 3 });
    });
  });

  describe("countNodesInPath", () => {
    it("should return number of nodes for learningPathId", async () => {
      prisma.learningPathNode.count.mockResolvedValue(7);
      const result = await ProgressService.countNodesInPath("path1");
      expect(result).toBe(7);
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
      const result = await ProgressService.countDoneProgressForStudent(7, ["a", "b"]);
      expect(result).toBe(3);
    });
  });

  describe("getTeamsForAssignment", () => {
    it("should get all team assignments with teams and students", async () => {
      const fakeTeams = [{ team: { students: [] } }];
      prisma.teamAssignment.findMany.mockResolvedValue(fakeTeams);

      const result = await ProgressService.getTeamsForAssignment(22);
      expect(result).toEqual(fakeTeams);
    });
  });
});
