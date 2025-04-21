import {
    createTeamsInAssignment,
    updateTeamsForAssignment,
    getTeamsThatHaveAssignment,
    deleteTeam,
  } from "../../../services/teacherTeamsService";
  import prisma from "../../../config/prisma";
  import { beforeEach, describe, expect, it, vi } from "vitest";
  
  vi.mock("../../../config/prisma", () => ({
    default: {
      team: {
        create: vi.fn(),
        update: vi.fn(),
        findUnique: vi.fn(),
        delete: vi.fn(),
        findMany: vi.fn(),
      },
      student: {
        findUnique: vi.fn(),
        findMany: vi.fn(),
      },
      classAssignment: {
        findMany: vi.fn(),
      },
      classStudent: {
        findMany: vi.fn(),
      },
    },
  }));
  
  describe("teacherTeamsService", () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });
  
    describe("createTeamsInAssignment", () => {
      it("throws error if assignment is not linked to class", async () => {
        vi.mocked(prisma.classAssignment.findMany).mockResolvedValue([]);
        await expect(
          createTeamsInAssignment(1, 2, [])
        ).rejects.toThrow("Assignment not found or not linked to any class.");
      });
  
      it("creates teams and assigns students", async () => {
        vi.mocked(prisma.classAssignment.findMany).mockResolvedValue([{ assignmentId: 1, classId: 2 }]);
        vi.mocked(prisma.team.create).mockResolvedValue({ id: 1, teamname: "Team A", classId: 2 } as any);
        vi.mocked(prisma.team.update).mockResolvedValue({ id: 1 } as any);
        vi.mocked(prisma.student.findUnique).mockResolvedValue({ userId: 100 } as any);
        vi.mocked(prisma.team.findUnique).mockResolvedValue({ id: 1 } as any);
  
        const result = await createTeamsInAssignment(1, 2, [
          { teamName: "Team A", studentIds: [100] },
        ]);
  
        expect(result).toHaveLength(1);
      });
    });
  
    describe("updateTeamsForAssignment", () => {
      it("throws error if team does not exist", async () => {
        vi.mocked(prisma.team.findUnique).mockResolvedValue(null);
        await expect(updateTeamsForAssignment(1, [
          { teamId: 1, teamName: "T", studentIds: [] }
        ])).rejects.toThrow("Team with ID 1 not found.");
      });
  
      it("throws error if student is invalid", async () => {
        vi.mocked(prisma.team.findUnique).mockResolvedValue({ id: 1 } as any);
        vi.mocked(prisma.student.findMany).mockResolvedValue([]);
        await expect(updateTeamsForAssignment(1, [
          { teamId: 1, teamName: "T", studentIds: [9] }
        ])).rejects.toThrow("Invalid student IDs: 9");
      });
  
      it("updates team name and students", async () => {
        vi.mocked(prisma.team.findUnique).mockResolvedValue({ id: 1 } as any);
        vi.mocked(prisma.student.findMany).mockResolvedValue([{ userId: 9 }] as any);
        vi.mocked(prisma.team.update).mockResolvedValue({ id: 1, teamname: "T" } as any);
  
        const updated = await updateTeamsForAssignment(1, [
          { teamId: 1, teamName: "T", studentIds: [9] }
        ]);
  
        expect(updated[0].teamname).toBe("T");
      });
    });
  
    describe("getTeamsThatHaveAssignment", () => {
      it("returns teams with assignment", async () => {
        vi.mocked(prisma.team.findMany).mockResolvedValue([{ id: 1 }, { id: 2 }] as any);
        const result = await getTeamsThatHaveAssignment(1);
        expect(result).toHaveLength(2);
      });
    });
  
    describe("deleteTeam", () => {
      it("deletes a team", async () => {
        const spy = vi.mocked(prisma.team.delete).mockResolvedValue({ id: 1 } as any);
        await deleteTeam(1);
        expect(spy).toHaveBeenCalledWith({ where: { id: 1 } });
      });
    });
  });
  