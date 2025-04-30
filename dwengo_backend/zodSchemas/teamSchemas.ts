import { z } from "zod";

const TeamDivisionSchema = z.object({
  teamName: z.string().min(1, { message: "Team name cannot be empty" }),
  studentIds: z
    .array(z.number().int().positive())
    .nonempty({ message: "Each team must have at least one student" }),
});

const IdentifiableTeamDivisionSchema = TeamDivisionSchema.extend({
  teamId: z.number().int().positive(),
});

export const createTeamParamSchema = z.object({
  assignmentId: z.coerce.number().int().positive({
    message: "assignmentId must be a positive integer",
  }),
  classId: z.coerce.number().int().positive({
    message: "classId must be a positive integer",
  }),
});

export const createTeamBodySchema = z.object({
  teams: z.array(TeamDivisionSchema),
});

export const getTeamParamSchema = z.object({
  assignmentId: z.coerce.number().int().positive({
    message: "assignmentId must be a positive integer",
  }),
});

export const updateTeamParamSchema = getTeamParamSchema;

export const updateTeamBodySchema = z.object({
  teams: z.array(IdentifiableTeamDivisionSchema),
});

export const deleteTeamParamSchema = getTeamParamSchema;
