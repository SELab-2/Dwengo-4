import { z } from "zod";

export const titleAndLanguageBodySchema = z.object({
  title: z.string().min(1, "Title is required"),
  language: z.string().min(1, "Language is required"),
});

export const joinRequestBodySchema = z.object({
  action: z.enum(["approve", "deny"]),
});

export const inviteActionBodySchema = z.object({
  action: z.enum(["accept", "decline"]),
});

export const localLearningObjectBodySchema = z.object({
  title: z.string(),
  description: z.string(),
  contentType: z.string(),
  keywords: z.array(z.string()).optional(),
  targetAges: z.array(z.number()).optional(),
  teacherExclusive: z.boolean().optional(),
  skosConcepts: z.array(z.string()).optional(),
  copyright: z.string().optional(),
  licence: z.string().optional(),
  difficulty: z.number().optional(),
  estimatedTime: z.number().optional(),
  available: z.boolean().optional(),
  contentLocation: z.string().optional(),
});

// For updates (partial):
export const partialLocalLearningObjectBodySchema =
  localLearningObjectBodySchema.partial();

/*
 * Check if the parameter teams conforms to the TeamDivision interface.
 * This is nothing more than an interface specifying how a class of students gets divided into teams.
 * */
const TeamDivisionSchema = z.object({
  teamName: z.string().min(1, { message: "Team name cannot be empty" }),
  studentIds: z
    .array(z.number().int().positive())
    .nonempty({ message: "Each team must have at least one student" }),
});

/*
 * Check if the parameter teams conform to the IdentifiableTeamDivision interface
 * An IdentifiableTeamDivision is the same as a TeamDivision but with an ID for the team
 * The reason for these interfaces is that when you are creating a team for the first time, it does not yet have
 * an ID. Meaning that when you are creating, TeamDivision is all the info you need.
 * On an update, however, you need to somehow find the team, which is why IdentifiableTeamDivision exists.
 * */
const IdentifiableTeamDivisionSchema = TeamDivisionSchema.extend({
  teamId: z.number().int().positive(),
});

export const teamsBodySchema = z.object({
  teams: z.array(TeamDivisionSchema),
});

export const identifiableTeamsBodySchema = z.object({
  teams: z.array(IdentifiableTeamDivisionSchema),
});

export const createQuestionSpecificBodySchema = z.object({
  teamId: z.coerce.number().int().positive(),
  title: z.string().min(1, "Title is required"),
  text: z.string().min(1, "Text is required"),

  isExternal: z.boolean(),
  isPrivate: z.boolean(),
  localLearningObjectId: z.string().optional(),
  dwengoHruid: z.string().optional(),
  dwengoLanguage: z.string().optional(),
  dwengoVersion: z.number().optional(),
});
