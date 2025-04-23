import {
  createTeamsInAssignment,
  updateTeamsForAssignment,
  getTeamsThatHaveAssignment,
  deleteTeam,
} from "../../../services/teacherTeamsService";

import prisma from "../../../config/prisma";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../../config/prisma");

describe("teacherTeamsService", () => {
  beforeEach(() => {
    // Handled by __mocks__/prisma.ts
  });

  describe("createTeamsInAssignment", () => {
    it("throws error if assignment is not linked to class", async () => {
      (prisma.classAssignment.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([]);

      await expect(
        createTeamsInAssignment(1, 2, [])
      ).rejects.toThrow("Assignment not found or not linked to any class.");
    });

    it("creates teams and assigns students", async () => {
      (prisma.classAssignment.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([
        { assignmentId: 1, classId: 2 }
      ]);
      (prisma.team.create as ReturnType<typeof vi.fn>).mockResolvedValue({
        id: 1, teamname: "Team A", classId: 2
      });
      (prisma.team.update as ReturnType<typeof vi.fn>).mockResolvedValue({ id: 1 });
      (prisma.student.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({ userId: 100 });
      (prisma.team.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({ id: 1 });

      const result = await createTeamsInAssignment(1, 2, [
        { teamName: "Team A", studentIds: [100] },
      ]);

      expect(result).toHaveLength(1);
    });
  });

  describe("updateTeamsForAssignment", () => {
    it("throws error if team does not exist", async () => {
      (prisma.team.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(null);

      await expect(updateTeamsForAssignment(1, [
        { teamId: 1, teamName: "T", studentIds: [] }
      ])).rejects.toThrow("Team with ID 1 not found.");
    });

    it("throws error if student is invalid", async () => {
      (prisma.team.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({ id: 1 });
      (prisma.student.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([]);

      await expect(updateTeamsForAssignment(1, [
        { teamId: 1, teamName: "T", studentIds: [9] }
      ])).rejects.toThrow("Invalid student IDs: 9");
    });

    it("updates team name and students", async () => {
      (prisma.team.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({ id: 1 });
      (prisma.student.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([{ userId: 9 }]);
      (prisma.team.update as ReturnType<typeof vi.fn>).mockResolvedValue({
        id: 1, teamname: "T"
      });

      const updated = await updateTeamsForAssignment(1, [
        { teamId: 1, teamName: "T", studentIds: [9] }
      ]);

      expect(updated[0].teamname).toBe("T");
    });
  });

  describe("getTeamsThatHaveAssignment", () => {
    it("returns teams with assignment", async () => {
      (prisma.team.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([
        { id: 1 }, { id: 2 }
      ]);

      const result = await getTeamsThatHaveAssignment(1);
      expect(result).toHaveLength(2);
    });
  });

  describe("deleteTeam", () => {
    it("deletes a team", async () => {
      const spy = prisma.team.delete as ReturnType<typeof vi.fn>;
      spy.mockResolvedValue({ id: 1 });

      await deleteTeam(1);
      expect(spy).toHaveBeenCalledWith({ where: { id: 1 } });
    });
  });
});
