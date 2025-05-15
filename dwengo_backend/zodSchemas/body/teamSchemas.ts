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

export const teamsBodySchema = z.object({
  teams: z.array(TeamDivisionSchema),
});

export const identifiableTeamsBodySchema = z.object({
  teams: z.array(IdentifiableTeamDivisionSchema),
});
