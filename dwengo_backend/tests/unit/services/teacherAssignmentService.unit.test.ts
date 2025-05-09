import { describe, it, expect, vi, beforeEach } from "vitest";
import TeacherAssignmentService from "../../../services/teacherServices/teacherAssignmentService";
import prisma from "../../../config/prisma";
import * as authService from "../../../services/authorizationService";
import * as teamService from "../../../services/teacherTeamsService";

vi.mock("../../../config/prisma");
vi.mock("../../../services/authorizationService");
vi.mock("../../../services/teacherTeamsService");
vi.mock("../../../services/referenceValidationService", () => ({
  default: {
    validateLearningPath: vi.fn(),
  },
}));

describe("TeacherAssignmentService", () => {
  const now = new Date();
  const mockAssignment = {
    id: 1,
    title: "Assignment",
    description: "Test",
    pathRef: "abc",
    isExternal: true,
    deadline: now,
    createdAt: now,
    updatedAt: now,
    teamSize: 3,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createAssignmentForClass", () => {
    it("throws if unauthorized", async () => {
      vi.mocked(authService.isAuthorized).mockResolvedValue(false);

      await expect(
        TeacherAssignmentService.createAssignmentForClass(
          1,
          1,
          "abc",
          "en",
          true,
          now,
          "Title",
          "Desc",
          3,
        ),
      ).rejects.toThrow("The teacher is unauthorized to perform this action");
    });

    it("creates assignment with validation", async () => {
      vi.mocked(authService.isAuthorized).mockResolvedValue(true);
      const validation = (
        await import("../../../services/referenceValidationService")
      ).default;
      vi.mocked(validation.validateLearningPath).mockResolvedValue();
      vi.mocked(prisma.assignment.create).mockResolvedValue(mockAssignment);

      const res = await TeacherAssignmentService.createAssignmentForClass(
        1,
        1,
        "abc",
        "en",
        true,
        now,
        "Title",
        "Desc",
        3,
      );

      expect(res).toEqual(mockAssignment);
    });
  });

  describe("getAllAssignments", () => {
    it("returns ordered list", async () => {
      vi.mocked(prisma.assignment.findMany).mockResolvedValue([mockAssignment]);

      const res = await TeacherAssignmentService.getAllAssignments(1, 5);
      expect(res).toHaveLength(1);
    });
  });

  describe("getAssignmentsByClass", () => {
    it("throws if unauthorized", async () => {
      vi.mocked(authService.isAuthorized).mockResolvedValue(false);

      await expect(
        TeacherAssignmentService.getAssignmentsByClass(1, 1),
      ).rejects.toThrow();
    });

    it("returns assignments", async () => {
      vi.mocked(authService.isAuthorized).mockResolvedValue(true);
      vi.mocked(prisma.assignment.findMany).mockResolvedValue([mockAssignment]);

      const res = await TeacherAssignmentService.getAssignmentsByClass(1, 1);
      expect(res).toHaveLength(1);
    });
  });

  describe("updateAssignment", () => {
    it("throws if not allowed", async () => {
      vi.mocked(authService.canUpdateOrDelete).mockResolvedValue(false);

      await expect(
        TeacherAssignmentService.updateAssignment(
          1,
          "abc",
          true,
          1,
          "T",
          "D",
          4,
        ),
      ).rejects.toThrow("The teacher is unauthorized to update the assignment");
    });

    it("updates if authorized", async () => {
      vi.mocked(authService.canUpdateOrDelete).mockResolvedValue(true);
      const validation = (
        await import("../../../services/referenceValidationService")
      ).default;
      vi.mocked(validation.validateLearningPath).mockResolvedValue();
      vi.mocked(prisma.assignment.update).mockResolvedValue(mockAssignment);

      const res = await TeacherAssignmentService.updateAssignment(
        1,
        "abc",
        true,
        1,
        "T",
        "D",
        4,
      );
      expect(res).toEqual(mockAssignment);
    });
  });

  describe("deleteAssignment", () => {
    it("throws if unauthorized", async () => {
      vi.mocked(authService.canUpdateOrDelete).mockResolvedValue(false);

      await expect(
        TeacherAssignmentService.deleteAssignment(1, 1),
      ).rejects.toThrow();
    });

    it("deletes assignment", async () => {
      vi.mocked(authService.canUpdateOrDelete).mockResolvedValue(true);
      vi.mocked(prisma.assignment.delete).mockResolvedValue(mockAssignment);

      const res = await TeacherAssignmentService.deleteAssignment(1, 1);
      expect(res).toEqual(mockAssignment);
    });
  });

  describe("createAssignmentWithTeams", () => {
    it("throws if one class is unauthorized", async () => {
      vi.mocked(authService.isAuthorized)
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(false);

      const teams = { 1: [], 2: [] };

      await expect(
        TeacherAssignmentService.createAssignmentWithTeams(
          1,
          "abc",
          "en",
          true,
          now,
          "T",
          "D",
          teams,
          4,
        ),
      ).rejects.toThrow("The teacher is unauthorized to perform this action");
    });

    it("runs full team creation flow", async () => {
      vi.mocked(authService.isAuthorized).mockResolvedValue(true);
      const validation = (
        await import("../../../services/referenceValidationService")
      ).default;
      vi.mocked(validation.validateLearningPath).mockResolvedValue();

      const tx = {
        assignment: {
          create: vi.fn().mockResolvedValue(mockAssignment),
        },
        classAssignment: {
          create: vi.fn().mockResolvedValue({}),
        },
      };

      vi.mocked(prisma.$transaction).mockImplementation(async (fn) =>
        fn(tx as any),
      );

      const teams = {
        1: [{ teamName: "Alpha", studentIds: [1, 2] }],
      };

      const res = await TeacherAssignmentService.createAssignmentWithTeams(
        1,
        "abc",
        "en",
        true,
        now,
        "T",
        "D",
        teams,
        4,
      );

      expect(res).toEqual(mockAssignment);
      expect(teamService.createTeamsInAssignment).toHaveBeenCalled();
    });
  });

  describe("updateAssignmentWithTeams", () => {
    it("throws if not authorized", async () => {
      vi.mocked(authService.canUpdateOrDelete).mockResolvedValue(false);

      await expect(
        TeacherAssignmentService.updateAssignmentWithTeams(
          1,
          1,
          "abc",
          "en",
          true,
          now,
          "T",
          "D",
          { 1: [] },
          4,
        ),
      ).rejects.toThrow();
    });

    it("handles full update flow", async () => {
      vi.mocked(authService.canUpdateOrDelete).mockResolvedValue(true);
      vi.mocked(authService.isAuthorized).mockResolvedValue(true);
      const validation = (
        await import("../../../services/referenceValidationService")
      ).default;
      vi.mocked(validation.validateLearningPath).mockResolvedValue();

      const tx = {
        assignment: {
          update: vi.fn().mockResolvedValue(mockAssignment),
        },
        team: {
          deleteMany: vi.fn().mockResolvedValue({}),
        },
        classAssignment: {
          findFirst: vi.fn().mockResolvedValue(null),
          create: vi.fn().mockResolvedValue({}),
        },
      };

      vi.mocked(prisma.$transaction).mockImplementation(async (fn) =>
        fn(tx as any),
      );

      const res = await TeacherAssignmentService.updateAssignmentWithTeams(
        1,
        1,
        "abc",
        "en",
        true,
        now,
        "T",
        "D",
        {
          1: [{ teamName: "A", studentIds: [1] }],
        },
        4,
      );

      expect(res).toEqual(mockAssignment);
    });
  });
});
