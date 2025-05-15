import { NotFoundError, BadRequestError } from "../../../errors/errors";
import prisma from "../../../config/prisma";
import {
  createTeamsInAssignment,
  updateTeamsForAssignment,
  getTeamsThatHaveAssignment,
  deleteTeam,
} from "../../../services/teacherTeamsService";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../../config/prisma");

describe("teacherTeamsService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (prisma as any).$transaction = vi
      .fn()
      .mockImplementation(async (cb: any) => cb(prisma));
  });

  describe("createTeamsInAssignment", () => {
    it("throws NotFoundError if assignment is not linked to class", async () => {
      const mockTx = {
        classAssignment: { findUnique: vi.fn().mockResolvedValue(null) },
        team: { create: vi.fn(), findUnique: vi.fn() },
        student: { findUnique: vi.fn() },
      } as any;

      await expect(createTeamsInAssignment(1, 2, [], mockTx)).rejects.toThrow(
        NotFoundError,
      );
      await expect(createTeamsInAssignment(1, 2, [], mockTx)).rejects.toThrow(
        "This assignment has not been assigned to this class yet.",
      );
    });

    it("creates teams and assigns students", async () => {
      const mockTx = {
        classAssignment: {
          findUnique: vi
            .fn()
            .mockResolvedValue({ assignmentId: 1, classId: 2 }),
        },
        team: {
          create: vi
            .fn()
            .mockResolvedValue({ id: 1, teamname: "Team A", classId: 2 }),
          update: vi
            .fn()
            .mockResolvedValue({ id: 1, teamname: "Team A", classId: 2 }),
          findUnique: vi
            .fn()
            .mockResolvedValue({ id: 1, teamname: "Team A", classId: 2 }),
        },
        student: { findUnique: vi.fn().mockResolvedValue({ userId: 100 }) },
      } as any;

      const result = await createTeamsInAssignment(
        1,
        2,
        [{ teamName: "Team A", studentIds: [100] }],
        mockTx,
      );

      expect(mockTx.team.create).toHaveBeenCalledWith({
        data: { teamname: "Team A", classId: 2 },
      });
      expect(mockTx.student.findUnique).toHaveBeenCalledWith({
        where: { userId: 100 },
      });
      expect(mockTx.team.findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(mockTx.team.update).toHaveBeenCalled();
      expect(result).toEqual([{ id: 1, teamname: "Team A", classId: 2 }]);
    });
  });

  describe("updateTeamsForAssignment", () => {
    it("throws NotFoundError if team does not exist", async () => {
      (prisma.team.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(
        null,
      );

      await expect(
        updateTeamsForAssignment(1, [
          { teamId: 1, teamName: "T", studentIds: [] },
        ]),
      ).rejects.toThrow(NotFoundError);
      await expect(
        updateTeamsForAssignment(1, [
          { teamId: 1, teamName: "T", studentIds: [] },
        ]),
      ).rejects.toThrow("Some of the teams do not exist.");
    });

    it("throws BadRequestError if student is invalid", async () => {
      (prisma.team.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
        id: 1,
      });
      (prisma.student.findMany as ReturnType<typeof vi.fn>).mockResolvedValue(
        [],
      );

      await expect(
        updateTeamsForAssignment(1, [
          { teamId: 1, teamName: "T", studentIds: [9] },
        ]),
      ).rejects.toThrow(BadRequestError);
      await expect(
        updateTeamsForAssignment(1, [
          { teamId: 1, teamName: "T", studentIds: [9] },
        ]),
      ).rejects.toThrow("There are invalid students in the request.");
    });

    it("updates team name and students", async () => {
      (prisma.team.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
        id: 1,
      });
      (prisma.student.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([
        { userId: 9 },
      ]);
      (prisma.team.update as ReturnType<typeof vi.fn>).mockResolvedValue({
        id: 1,
        teamname: "T",
        classId: 2,
      });

      const result = await updateTeamsForAssignment(1, [
        { teamId: 1, teamName: "T", studentIds: [9] },
      ]);

      expect(prisma.team.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          teamname: "T",
          students: { set: [{ userId: 9 }] },
          teamAssignment: {
            connectOrCreate: {
              where: { teamId_assignmentId: { teamId: 1, assignmentId: 1 } },
              create: { assignmentId: 1 },
            },
          },
        },
      });
      expect(result).toEqual([{ id: 1, teamname: "T", classId: 2 }]);
    });
  });

  describe("getTeamsThatHaveAssignment", () => {
    it("returns teams with assignment", async () => {
      (prisma.team.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([
        { id: 1 },
        { id: 2 },
      ]);

      const result = await getTeamsThatHaveAssignment(1);

      expect(prisma.team.findMany).toHaveBeenCalledWith({
        where: { teamAssignment: { assignmentId: 1 } },
      });
      expect(result).toHaveLength(2);
    });
  });

  describe("deleteTeam", () => {
    it("deletes a team", async () => {
      (prisma.team.delete as ReturnType<typeof vi.fn>).mockResolvedValue({
        id: 1,
      });

      await deleteTeam(1);
      expect(prisma.team.delete).toHaveBeenCalledWith({ where: { id: 1 } });
    });
  });
});
