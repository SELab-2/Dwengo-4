import { z } from "zod";

export const getLearningPathParamsSchema = z.object({
  pathId: z.coerce.string({
    message: "LearningPathId was missing or couldn't be converted to a string",
  }),
});
