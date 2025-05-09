import { describe, it, expect, vi, beforeEach } from "vitest";
import { Request, Response, NextFunction } from "express";

import {
  makeAssignmentIdParamValid,
  makeTeamIdParamValid,
  ensureTeamsParamValidTeamDivision,
  ensureTeamParamValidIdentifiableTeamDivision,
} from "../../../middleware/teamValidationMiddleware";

vi.mock("../../../config/prisma");

//  Response & Next mocks
const mockRes = (): Response => {
  const json = vi.fn();
  const status = vi.fn(() => ({ json }));
  return { status, json } as unknown as Response;
};

const mockNext = () => vi.fn() as NextFunction;

describe("teamValidationMiddleware", () => {
  let res: Response;
  let next: NextFunction;

  beforeEach(() => {
    res = mockRes();
    next = mockNext();
  });

  // === makeAssignmentIdParamValid ===
  describe("makeAssignmentIdParamValid", () => {
    it("calls next if assignmentId is a valid number", async () => {
      const req = { params: { assignmentId: "42" } } as any;
      await makeAssignmentIdParamValid(req, res, next);
      expect(next).toHaveBeenCalled();
    });

    it("responds 400 if assignmentId is not a number", async () => {
      const req = { params: { assignmentId: "abc" } } as any;
      await makeAssignmentIdParamValid(req, res, next);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.status(400).json).toHaveBeenCalledWith({
        error: "Invalid assignment ID. It must be a number.",
      });
    });
  });

  // === makeTeamIdParamValid ===
  describe("makeTeamIdParamValid", () => {
    it("calls next if teamId is a valid number", async () => {
      const req = { params: { teamId: "123" } } as any;
      await makeTeamIdParamValid(req, res, next);
      expect(next).toHaveBeenCalled();
    });

    it("responds 400 if teamId is not a number", async () => {
      const req = { params: { teamId: "xyz" } } as any;
      await makeTeamIdParamValid(req, res, next);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.status(400).json).toHaveBeenCalledWith({
        error: "Invalid team ID. It must be a number.",
      });
    });
  });

  // === ensureTeamsParamValidTeamDivision ===
  describe("ensureTeamsParamValidTeamDivision", () => {
    it("calls next if valid team division array is passed", async () => {
      const req = {
        body: {
          teams: [
            { teamName: "Team A", studentIds: [1, 2] },
            { teamName: "Team B", studentIds: [3] },
          ],
        },
      } as Request;

      await ensureTeamsParamValidTeamDivision(req, res, next);
      expect(next).toHaveBeenCalled();
    });

    it("rejects if teamName is empty", async () => {
      const req = {
        body: {
          teams: [{ teamName: "", studentIds: [1, 2] }],
        },
      } as Request;

      await ensureTeamsParamValidTeamDivision(req, res, next);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.status(400).json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.arrayContaining([
            expect.objectContaining({ message: "Team name cannot be empty" }),
          ]),
        }),
      );
    });

    it("rejects if studentIds is empty", async () => {
      const req = {
        body: {
          teams: [{ teamName: "Solo", studentIds: [] }],
        },
      } as Request;

      await ensureTeamsParamValidTeamDivision(req, res, next);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.status(400).json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.arrayContaining([
            expect.objectContaining({
              message: "Each team must have at least one student",
            }),
          ]),
        }),
      );
    });

    it("rejects if studentIds contains a non-number", async () => {
      const req = {
        body: {
          teams: [{ teamName: "Broken", studentIds: ["x"] }],
        },
      } as Request;

      await ensureTeamsParamValidTeamDivision(req, res, next);
      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  // === ensureTeamParamValidIdentifiableTeamDivision ===
  describe("ensureTeamParamValidIdentifiableTeamDivision", () => {
    it("calls next if valid identifiable team division array is passed", async () => {
      const req = {
        body: {
          teams: [
            { teamId: 1, teamName: "Team A", studentIds: [1, 2] },
            { teamId: 2, teamName: "Team B", studentIds: [3] },
          ],
        },
      } as Request;

      await ensureTeamParamValidIdentifiableTeamDivision(req, res, next);
      expect(next).toHaveBeenCalled();
    });

    it("rejects if teamId is missing", async () => {
      const req = {
        body: {
          teams: [{ teamName: "No ID", studentIds: [1] }],
        },
      } as Request;

      await ensureTeamParamValidIdentifiableTeamDivision(req, res, next);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it("rejects if teamId is negative", async () => {
      const req = {
        body: {
          teams: [{ teamId: -1, teamName: "Oops", studentIds: [1] }],
        },
      } as Request;

      await ensureTeamParamValidIdentifiableTeamDivision(req, res, next);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it("rejects if studentIds is malformed", async () => {
      const req = {
        body: {
          teams: [{ teamId: 5, teamName: "Oops", studentIds: ["NaN"] }],
        },
      } as Request;

      await ensureTeamParamValidIdentifiableTeamDivision(req, res, next);
      expect(res.status).toHaveBeenCalledWith(400);
    });
  });
});
