import { z } from "zod";

// SINGLE FIELD SCHEMAS //
const makeIdParamSchema = (key: string) =>
  z.object({
    [key]: z.coerce.number().int().positive(),
  });

// Usage
export const classIdParamsSchema = makeIdParamSchema("classId");
export const inviteIdParamsSchema = makeIdParamSchema("inviteId");
export const requestIdParamsSchema = makeIdParamSchema("requestId");
export const assignmentIdParamsSchema = makeIdParamSchema("assignmentId");
export const teamIdParamsSchema = makeIdParamSchema("teamId");
export const submissionIdParamsSchema = makeIdParamSchema("submissionId");
export const questionIdParamsSchema = makeIdParamSchema("questionId");
export const studentIdParamsSchema = makeIdParamSchema("studentId");
export const questionMessageIdParamsSchema =
  makeIdParamSchema("questionMessageId");

// MERGED SCHEMAS //
export const classAndInviteIdParamsSchema =
  classIdParamsSchema.merge(inviteIdParamsSchema);

export const classAndRequestIdParamsSchema = classIdParamsSchema.merge(
  requestIdParamsSchema,
);

export const classAndAssignmentIdParamsSchema = classIdParamsSchema.merge(
  assignmentIdParamsSchema,
);

export const teamAndAssignmentIdParamsSchema = teamIdParamsSchema.merge(
  assignmentIdParamsSchema,
);
