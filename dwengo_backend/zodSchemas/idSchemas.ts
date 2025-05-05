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

export const assignmentIdParamsSchema = z.object({
  assignmentId: z.coerce.number().int().positive(),
});

export const teamIdParamsSchema = z.object({
  teamId: z.coerce.number().int().positive(),
});

export const submissionIdParamsSchema = z.object({
  submissionId: z.coerce.number().int().positive(),
});

export const questionIdParamsSchema = z.object({
  questionId: z.coerce.number().int().positive(),
});

// MERGED SCHEMAS //
export const classAndInviteIdParamsSchema =
  classIdParamsSchema.merge(inviteIdParamsSchema);

export const classAndRequestIdParamsSchema = classIdParamsSchema.merge(
  requestIdParamsSchema,
);

export const classAndAssignmentIdParamsSchema = classIdParamsSchema.merge(
  assignmentIdParamsSchema,
);
