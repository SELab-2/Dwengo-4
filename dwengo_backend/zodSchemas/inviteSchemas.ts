import { z } from "zod";

/**
 * schemas for invite creation route (POST /teacher/classes/:classId/invites)
 */
export const createInviteBodySchema = z.object({
  // Hier wordt geen coerce gebruikt omdat req.body JSON-Parsed is door Express, dus het is al een getal
  otherTeacherId: z.number().int().positive(),
});
export const createInviteParamsSchema = z.object({
  classId: z.coerce
    .number({ message: "classId should be a number" })
    .int({ message: "classId should be an integer" })
    .positive({ message: "classId should be a positive integer" }),
});

/**
 * schema for get invites for a class route (GET /teacher/classes/:classId/invites)
 */
export const getClassInvitesParamsSchema = createInviteParamsSchema; // also just classId

/**
 * schemas for update invite route (PATCH /teacher/classes/invites/:inviteId)
 */
export const updateInviteBodySchema = z.object({
  action: z.enum(["accept", "decline"]),
});
export const updateInviteParamsSchema = z.object({
  inviteId: z.coerce
    .number({ message: "inviteId should be a number" })
    .int({ message: "inviteId should be an integer" })
    .positive({ message: "inviteId should be a positive integer" }),
});

/**
 * schema for delete invite route (DELETE /teacher/classes/:classId/invites/:inviteId)
 */
export const deleteInviteParamsSchema = createInviteParamsSchema.merge(
  updateInviteParamsSchema,
); // classId and inviteId
