import { z } from "zod";

// SINGLE FIELD SCHEMAS //
export const classIdParamsSchema = z.object({
  classId: z.coerce.number().int().positive(),
});

export const inviteIdParamsSchema = z.object({
  inviteId: z.coerce.number().int().positive(),
});

export const requestIdParamsSchema = z.object({
  requestId: z.coerce.number().int().positive(),
});

// MERGED SCHEMAS //
export const classAndInviteIdParamsSchema =
  classIdParamsSchema.merge(inviteIdParamsSchema);

export const classAndRequestIdParamsSchema = classIdParamsSchema.merge(
  requestIdParamsSchema,
);
