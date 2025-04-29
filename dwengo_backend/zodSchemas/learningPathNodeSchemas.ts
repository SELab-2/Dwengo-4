import { z } from "zod";

export const getLearningPathNodeParamsSchema = z.object({
  pathId: z.coerce.string({
    message: "LearningPathId was missing or couldn't be converted to a string",
  }),
});

/*export const createLearningPathNodeParamsSchema =
  getLearningPathNodeParamsSchema;*/

export const updateLearningPathNodeParamsSchema = z.object({
  pathId: z.coerce.string({
    message: "LearningPathId was missing or couldn't be converted to a string",
  }),
  nodeId: z.coerce.string({
    message:
      "LearningPathNodeId was missing or couldn't be converted to a string",
  }),
});

/*export const deleteLearningPathNodeParamsSchema =
  updateLearningPathNodeParamsSchema;*/
