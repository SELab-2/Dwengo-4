import { z } from "zod";

const makeIdParamSchema = (key: string) =>
  z.object({
    [key]: z.coerce.number().int().positive(),
  });

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
