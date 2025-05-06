import { z } from "zod";
import { assignmentIdParamsSchema } from "./idSchemas";

export const learningObjectParamsSchema = z.object({
  hruid: z.string().min(1, "Hruid is required."),
  language: z.string().min(1, "Language is required."),
  version: z.coerce
    .number()
    .int()
    .positive("Version must be a positive number."),
});

// Helper function to create string schemas
const requiredId = (fieldName: string, label?: string) =>
  z.object({
    [fieldName]: z.string().min(1, `${label ?? fieldName} is required.`),
  });

export const learningObjectIdParamSchema = requiredId(
  "learningObjectId",
  "LearningObjectId",
);
export const learningPathIdParamSchema = requiredId(
  "learningPathId",
  "LearningPathId",
);
export const pathIdSchema = requiredId("pathId", "PathId");
export const learningPathIdSchema = requiredId(
  "learningPathId",
  "LearningPathId",
);
export const nodeIdSchema = requiredId("nodeId", "NodeId");
export const evaluationIdSchema = requiredId("evaluationId", "EvaluationId");

export const nodeAndLearningPathIdSchema =
  nodeIdSchema.merge(learningPathIdSchema);

export const assignmentAndEvaluationIdParamSchema = evaluationIdSchema.merge(
  assignmentIdParamsSchema,
);
