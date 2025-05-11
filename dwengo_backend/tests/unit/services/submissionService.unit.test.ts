import { describe, it, expect, vi, beforeEach } from "vitest";
import prisma from "../../../config/prisma";
import submissionService from "../../../services/submissionService";
import { AccesDeniedError } from "../../../errors/errors";

vi.mock("../../../config/prisma");

describe("submissionService", () => {
  beforeEach(() => {
    // Automatisch gereset in __mocks__/prisma.ts
  });

  // === createSubmission ===
  describe("createSubmission", () => {
    it("maakt een submission aan als student in team zit", async () => {
      (prisma.team.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue({
        id: 5,
      });
      (prisma.submission.create as ReturnType<typeof vi.fn>).mockResolvedValue({
        id: 1,
        evaluationId: "ev123",
        teamId: 5,
        assignmentId: 10,
      });

      const result = await submissionService.createSubmission(1, "ev123", 10);

      expect(result).toEqual({
        id: 1,
        evaluationId: "ev123",
        teamId: 5,
        assignmentId: 10,
      });

      expect(prisma.submission.create).toHaveBeenCalledWith({
        data: {
          evaluationId: "ev123",
          teamId: 5,
          assignmentId: 10,
        },
      });
    });

    it("gooit AccesDeniedError als student niet in team zit", async () => {
      (prisma.team.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(
        null,
      );

      await expect(() =>
        submissionService.createSubmission(1, "ev123", 10),
      ).rejects.toThrow(AccesDeniedError);
    });
  });

  // === getSubmissionsForAssignment ===
  describe("getSubmissionsForAssignment", () => {
    it("haalt submissions op voor student + assignment", async () => {
      const mockSubs = [{ id: 1 }, { id: 2 }];
      (
        prisma.submission.findMany as ReturnType<typeof vi.fn>
      ).mockResolvedValue(mockSubs);

      const result = await submissionService.getSubmissionsForAssignment(10, 1);
      expect(result).toEqual(mockSubs);

      expect(prisma.submission.findMany).toHaveBeenCalledWith({
        where: {
          assignmentId: 10,
          team: {
            students: {
              some: { userId: 1 },
            },
            teamAssignment: { assignmentId: 10 },
          },
        },
      });
    });

    it("retourneert lege array als geen submissions zijn", async () => {
      (
        prisma.submission.findMany as ReturnType<typeof vi.fn>
      ).mockResolvedValue([]);

      const result = await submissionService.getSubmissionsForAssignment(
        10,
        99,
      );
      expect(result).toEqual([]);
    });
  });

  // === getSubmissionsForEvaluation ===
  describe("getSubmissionsForEvaluation", () => {
    it("haalt submissions op voor eval, student en assignment", async () => {
      const submissions = [{ id: 1 }];
      (
        prisma.submission.findMany as ReturnType<typeof vi.fn>
      ).mockResolvedValue(submissions);

      const result = await submissionService.getSubmissionsForEvaluation(
        10,
        "ev123",
        1,
      );
      expect(result).toEqual(submissions);

      expect(prisma.submission.findMany).toHaveBeenCalledWith({
        where: {
          assignmentId: 10,
          evaluationId: "ev123",
          team: {
            students: { some: { userId: 1 } },
            teamAssignment: { assignmentId: 10 },
          },
        },
      });
    });

    it("retourneert lege array bij geen match", async () => {
      (
        prisma.submission.findMany as ReturnType<typeof vi.fn>
      ).mockResolvedValue([]);

      const result = await submissionService.getSubmissionsForEvaluation(
        1,
        "evXXX",
        2,
      );
      expect(result).toEqual([]);
    });
  });

  // === teacherGetSubmissionsForStudent ===
  describe("teacherGetSubmissionsForStudent", () => {
    it("geeft submissions als teacher toegang heeft", async () => {
      const mockData = [{ id: 1 }];
      (
        prisma.submission.findMany as ReturnType<typeof vi.fn>
      ).mockResolvedValue(mockData);

      const result = await submissionService.teacherGetSubmissionsForStudent(
        5,
        2,
        10,
      );
      expect(result).toEqual(mockData);

      expect(prisma.submission.findMany).toHaveBeenCalledWith({
        where: {
          team: {
            students: {
              some: { userId: 5 },
            },
          },
          assignment: {
            id: 10,
            classAssignments: {
              some: {
                class: {
                  ClassTeacher: {
                    some: { teacherId: 2 },
                  },
                },
              },
            },
          },
        },
      });
    });

    it("retourneert lege array als niets gevonden", async () => {
      (
        prisma.submission.findMany as ReturnType<typeof vi.fn>
      ).mockResolvedValue([]);

      const result = await submissionService.teacherGetSubmissionsForStudent(
        1,
        1,
        1,
      );
      expect(result).toEqual([]);
    });
  });

  // === teacherGetSubmissionsForTeam ===
  describe("teacherGetSubmissionsForTeam", () => {
    it("geeft submissions van team met teacher toegang", async () => {
      const subs = [{ id: 101 }];
      (
        prisma.submission.findMany as ReturnType<typeof vi.fn>
      ).mockResolvedValue(subs);

      const result = await submissionService.teacherGetSubmissionsForTeam(
        4,
        3,
        10,
      );
      expect(result).toEqual(subs);

      expect(prisma.submission.findMany).toHaveBeenCalledWith({
        where: {
          team: { id: 4 },
          assignment: {
            id: 10,
            classAssignments: {
              some: {
                class: {
                  ClassTeacher: {
                    some: { teacherId: 3 },
                  },
                },
              },
            },
          },
        },
      });
    });

    it("retourneert lege array bij geen match", async () => {
      (
        prisma.submission.findMany as ReturnType<typeof vi.fn>
      ).mockResolvedValue([]);

      const result = await submissionService.teacherGetSubmissionsForTeam(
        1,
        2,
        3,
      );
      expect(result).toEqual([]);
    });
  });
});
