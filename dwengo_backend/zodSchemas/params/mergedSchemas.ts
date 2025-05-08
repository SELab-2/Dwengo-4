import {
  assignmentIdParamsSchema,
  classIdParamsSchema,
  inviteIdParamsSchema,
  requestIdParamsSchema,
  teamIdParamsSchema,
} from "./numericIdSchemas";
import {
  evaluationIdSchema,
  learningPathIdSchema,
  nodeIdSchema,
} from "./stringIdSchemas";

export const classAndInviteIdParamsSchema =
  classIdParamsSchema.merge(inviteIdParamsSchema);

export const classAndRequestIdParamsSchema = classIdParamsSchema.merge(
  requestIdParamsSchema,
);

export const teamAndAssignmentIdParamsSchema = teamIdParamsSchema.merge(
  assignmentIdParamsSchema,
);

export const assignmentAndEvaluationIdParamSchema =
  assignmentIdParamsSchema.merge(evaluationIdSchema);

export const classAndAssignmentIdParamsSchema = classIdParamsSchema.merge(
  assignmentIdParamsSchema,
);

export const nodeAndLearningPathIdSchema =
  nodeIdSchema.merge(learningPathIdSchema);
