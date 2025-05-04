import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../interfaces/extendedTypeInterfaces";
import asyncHandler from "express-async-handler";
import { z } from "zod";
import { BadRequestError } from "../errors/errors";
import { validateRequest } from "./validateRequest";

// Checks if the AssignmentId parameter from "/teacher/:assignmentId" is a valid Number
export const makeAssignmentIdParamValid = asyncHandler(
  async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    const assignmentId: number = Number(req.params.assignmentId);

    if (isNaN(assignmentId)) {
      throw new BadRequestError("Invalid assignment ID. It must be a number.");
    }

    next();
  },
);

// Checks if the TeamId parameter from "/teacher/:assignmentId/:teamId" is a valid Number
export const makeTeamIdParamValid = asyncHandler(
  async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    const teamIdNumber: number = Number(req.params.teamId);

    if (isNaN(teamIdNumber)) {
      throw new BadRequestError("Invalid team ID. It must be a number.");
    }

    next();
  },
);

const TeamDivisionSchema = z.object({
  teamName: z.string().min(1, { message: "Team name cannot be empty" }),
  studentIds: z
    .array(z.number().int().positive())
    .nonempty({ message: "Each team must have at least one student" }),
});

const IdentifiableTeamDivisionSchema = TeamDivisionSchema.extend({
  teamId: z.number().int().positive(),
});

/*
 * Check if the parameter teams conforms to the TeamDivision interface.
 * This is nothing more than an interface specifying how a class of students gets divided into teams.
 * */
export const ensureTeamsParamValidTeamDivision = validateRequest({
  customErrorMessage: "Invalid division of teams.",
  bodySchema: z.object({
    teams: z.array(TeamDivisionSchema),
  }),
});

/*
 * Check if the parameter teams conforms to the IdentifiableTeamDivision interface
 * An IdentifiableTeamDivision is the same as a TeamDivision but with a ID for the team
 * The reason for these interfaces is that when you are creating a team for the first time, it does not yet have
 * an ID. Meaning that when you are creating, TeamDivision is all the info you need.
 * On an update however, you need to somehow find the team, which is why IdentifiableTeamDivision exists.
 * */
export const ensureTeamParamValidIdentifiableTeamDivision = validateRequest({
  customErrorMessage: "Invalid identifiable division of teams.",
  bodySchema: z.object({
    teams: z.array(IdentifiableTeamDivisionSchema),
  }),
});
