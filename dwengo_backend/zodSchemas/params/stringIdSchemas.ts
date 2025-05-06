import { z } from "zod";

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
export const learningObjectIdSchema = requiredId(
  "learningObjectId",
  "LearningObjectId",
);
export const nodeIdSchema = requiredId("nodeId", "NodeId");
export const evaluationIdSchema = requiredId("evaluationId", "EvaluationId");
