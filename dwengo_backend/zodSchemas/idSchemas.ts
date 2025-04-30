import { z } from "zod";

export const classIdParamsSchema = z.object({
  classId: z.coerce.number().int().positive(),
});

export const inviteIdParamsSchema = z.object({
  inviteId: z.coerce.number().int().positive(),
});

export const classAndInviteIdParamsSchema =
  classIdParamsSchema.merge(inviteIdParamsSchema);
