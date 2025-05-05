import { z } from "zod";

export const learningObjectParamsSchema = z.object({
  hruid: z.string().min(1, "Hruid is required."),
  language: z.string().min(1, "Language is required."),
  version: z.coerce
    .number()
    .int()
    .positive("Version must be a positive number."),
});

export const pathIdSchema = z.object({
  pathId: z.string().min(1, "PathId is required."),
});

export const learningPathIdSchema = z.object({
  learningPathId: z.string().min(1, "LearningPathId is required."),
});

export const nodeIdSchema = z.object({
  nodeId: z.string().min(1, "NodeId is required."),
});

export const nodeAndLearningPathIdSchema =
  nodeIdSchema.merge(learningPathIdSchema);
